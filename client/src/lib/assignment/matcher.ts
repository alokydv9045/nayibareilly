/**
 * Skill Matching System
 * Matches staff expertise with issue requirements
 */

import {
  StaffMember,
  StaffSpecialization,
  getRequiredSpecializations,
  calculateSkillMatchScore,
  calculateWorkloadScore
} from './assignment.config'

export interface SkillMatch {
  staffId: string
  staffName: string
  matchScore: number // 0-100
  matchLevel: 'excellent' | 'good' | 'fair' | 'poor'
  matchReasons: string[]
  specializations: StaffSpecialization[]
  currentWorkload: number
  maxCapacity: number
  isAvailable: boolean
  recommendationPriority: number // 1 = highest priority
}

export interface MatchCriteria {
  issueCategory: string
  issuePriority?: string
  issueLocation?: string
  requiredSkills?: string[]
}

/**
 * Get match level based on score
 */
export function getMatchLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

/**
 * Get match level color
 */
export function getMatchLevelColor(level: 'excellent' | 'good' | 'fair' | 'poor'): string {
  const colors = {
    excellent: 'green',
    good: 'blue',
    fair: 'yellow',
    poor: 'red'
  }
  return colors[level]
}

/**
 * Generate match reasons for display
 */
export function generateMatchReasons(
  staff: StaffMember,
  criteria: MatchCriteria
): string[] {
  const reasons: string[] = []
  const requiredSpecs = getRequiredSpecializations(criteria.issueCategory)

  // Check specialization match
  const hasExactMatch = staff.specializations.some(s => requiredSpecs.includes(s))
  if (hasExactMatch) {
    const matchingSpec = staff.specializations.find(s => requiredSpecs.includes(s))
    reasons.push(`Specialized in ${matchingSpec}`)
  }

  // Check skills match
  if (criteria.requiredSkills) {
    const matchingSkills = staff.skills.filter(skill =>
      criteria.requiredSkills!.some(req => 
        skill.toLowerCase().includes(req.toLowerCase())
      )
    )
    if (matchingSkills.length > 0) {
      reasons.push(`Has relevant skills: ${matchingSkills.join(', ')}`)
    }
  }

  // Check experience
  if (staff.experienceYears >= 5) {
    reasons.push(`${staff.experienceYears} years of experience`)
  }

  // Check workload
  const workloadPercent = (staff.currentWorkload / staff.maxCapacity) * 100
  if (workloadPercent < 40) {
    reasons.push('Low current workload')
  } else if (workloadPercent < 70) {
    reasons.push('Moderate workload')
  } else if (workloadPercent < 100) {
    reasons.push('High workload')
  } else {
    reasons.push('At full capacity')
  }

  // Check availability
  if (!staff.isAvailable) {
    reasons.push('Currently unavailable')
  }

  return reasons
}

/**
 * Find best staff matches for an issue
 */
export function findStaffMatches(
  staffList: StaffMember[],
  criteria: MatchCriteria,
  limit: number = 10
): SkillMatch[] {
  const matches: SkillMatch[] = staffList.map(staff => {
    const requiredSpecs = getRequiredSpecializations(criteria.issueCategory)
    
    // Calculate scores
    const skillScore = calculateSkillMatchScore(
      staff.specializations,
      requiredSpecs,
      staff.skills,
      criteria.issueCategory
    )
    const workloadScore = calculateWorkloadScore(staff.currentWorkload, staff.maxCapacity)
    const totalScore = skillScore + workloadScore

    // Generate match reasons
    const matchReasons = generateMatchReasons(staff, criteria)
    const matchLevel = getMatchLevel(totalScore)

    return {
      staffId: staff.id,
      staffName: staff.name,
      matchScore: totalScore,
      matchLevel,
      matchReasons,
      specializations: staff.specializations,
      currentWorkload: staff.currentWorkload,
      maxCapacity: staff.maxCapacity,
      isAvailable: staff.isAvailable,
      recommendationPriority: 0 // Will be set after sorting
    }
  })

  // Sort by score (highest first)
  const sorted = matches.sort((a, b) => {
    // First by score
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore
    }
    
    // Then by availability
    if (a.isAvailable !== b.isAvailable) {
      return a.isAvailable ? -1 : 1
    }
    
    // Then by workload (lower is better)
    return a.currentWorkload - b.currentWorkload
  })

  // Set recommendation priority
  sorted.forEach((match, index) => {
    match.recommendationPriority = index + 1
  })

  return sorted.slice(0, limit)
}

/**
 * Get top recommendation (best match)
 */
export function getTopRecommendation(
  staffList: StaffMember[],
  criteria: MatchCriteria
): SkillMatch | null {
  const matches = findStaffMatches(staffList, criteria, 1)
  return matches.length > 0 ? matches[0] : null
}

/**
 * Compare two staff members for an issue
 */
export function compareStaffForIssue(
  staff1: StaffMember,
  staff2: StaffMember,
  criteria: MatchCriteria
): {
  better: 'staff1' | 'staff2' | 'equal'
  reason: string
  score1: number
  score2: number
} {
  const requiredSpecs = getRequiredSpecializations(criteria.issueCategory)
  
  const score1 = 
    calculateSkillMatchScore(staff1.specializations, requiredSpecs, staff1.skills, criteria.issueCategory) +
    calculateWorkloadScore(staff1.currentWorkload, staff1.maxCapacity)
  
  const score2 = 
    calculateSkillMatchScore(staff2.specializations, requiredSpecs, staff2.skills, criteria.issueCategory) +
    calculateWorkloadScore(staff2.currentWorkload, staff2.maxCapacity)

  let better: 'staff1' | 'staff2' | 'equal' = 'equal'
  let reason = 'Both staff members are equally suitable'

  if (score1 > score2) {
    better = 'staff1'
    reason = `${staff1.name} has better skill match and/or lower workload`
  } else if (score2 > score1) {
    better = 'staff2'
    reason = `${staff2.name} has better skill match and/or lower workload`
  }

  return { better, reason, score1, score2 }
}

/**
 * Get skill gap analysis for a staff member
 */
export function analyzeSkillGap(
  staff: StaffMember,
  criteria: MatchCriteria
): {
  hasRequiredSkills: boolean
  missingSpecializations: StaffSpecialization[]
  suggestedTraining: string[]
} {
  const requiredSpecs = getRequiredSpecializations(criteria.issueCategory)
  const hasRequiredSkills = requiredSpecs.some(req => staff.specializations.includes(req))
  
  const missingSpecializations = requiredSpecs.filter(
    req => !staff.specializations.includes(req)
  )

  const suggestedTraining: string[] = []
  missingSpecializations.forEach(spec => {
    suggestedTraining.push(`Training in ${spec} category`)
  })

  if (criteria.requiredSkills) {
    const missingSkills = criteria.requiredSkills.filter(
      req => !staff.skills.some(skill => 
        skill.toLowerCase().includes(req.toLowerCase())
      )
    )
    missingSkills.forEach(skill => {
      suggestedTraining.push(`Skill development: ${skill}`)
    })
  }

  return {
    hasRequiredSkills,
    missingSpecializations,
    suggestedTraining
  }
}

/**
 * Get alternative staff suggestions when preferred choice is unavailable
 */
export function getAlternativeSuggestions(
  staffList: StaffMember[],
  unavailableStaffId: string,
  criteria: MatchCriteria,
  limit: number = 3
): SkillMatch[] {
  // Filter out the unavailable staff
  const availableStaff = staffList.filter(staff => 
    staff.id !== unavailableStaffId && 
    staff.isAvailable &&
    staff.currentWorkload < staff.maxCapacity
  )

  return findStaffMatches(availableStaff, criteria, limit)
}

/**
 * Validate if staff member is suitable for assignment
 */
export function validateStaffForAssignment(
  staff: StaffMember,
  criteria: MatchCriteria
): {
  canAssign: boolean
  warnings: string[]
  blockers: string[]
} {
  const warnings: string[] = []
  const blockers: string[] = []

  // Check availability
  if (!staff.isAvailable) {
    blockers.push('Staff member is currently unavailable')
  }

  // Check capacity
  if (staff.currentWorkload >= staff.maxCapacity) {
    blockers.push('Staff member is at maximum capacity')
  }

  // Check specialization match
  const requiredSpecs = getRequiredSpecializations(criteria.issueCategory)
  const hasMatch = staff.specializations.some(s => requiredSpecs.includes(s))
  
  if (!hasMatch) {
    warnings.push('Staff member does not have exact specialization match')
  }

  // Check workload
  const workloadPercent = (staff.currentWorkload / staff.maxCapacity) * 100
  if (workloadPercent > 80) {
    warnings.push('Staff member has heavy workload (>80% capacity)')
  }

  return {
    canAssign: blockers.length === 0,
    warnings,
    blockers
  }
}
