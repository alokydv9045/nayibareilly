$dirs = @(
  'c:\Users\alokyadav\Desktop\Alok\nayibareilly\client\src\app\techadmin',
  'c:\Users\alokyadav\Desktop\Alok\nayibareilly\client\src\app\moderator',
  'c:\Users\alokyadav\Desktop\Alok\nayibareilly\client\src\app\department',
  'c:\Users\alokyadav\Desktop\Alok\nayibareilly\client\src\app\staff',
  'c:\Users\alokyadav\Desktop\Alok\nayibareilly\client\src\app\mayor'
)

foreach ($dir in $dirs) {
  if (Test-Path $dir) {
    $files = Get-ChildItem -Path $dir -Filter '*.tsx' -Recurse
    foreach ($f in $files) {
      $path = $f.FullName
      $c = Get-Content $path -Raw -Encoding UTF8
      
      $original = $c

      # Fix invisible purple subtitle text
      $c = $c -replace 'text-purple-200', 'text-gray-500'
      # Fix amber muted text to standard gray
      $c = $c -replace 'text-amber-800/80', 'text-gray-600'
      $c = $c -replace 'text-amber-800', 'text-gray-600'
      # Fix amber dark heading text to standard gray-900
      $c = $c -replace 'text-amber-950', 'text-gray-900'
      # Fix amber borders to standard gray
      $c = $c -replace 'border-amber-200/60', 'border-gray-200'
      $c = $c -replace 'border-amber-200', 'border-gray-200'
      # Fix amber hover states
      $c = $c -replace 'hover:bg-amber-100/50', 'hover:bg-gray-50'
      $c = $c -replace 'hover:bg-amber-50/50', 'hover:bg-gray-50'
      $c = $c -replace 'hover:bg-amber-50/20', 'hover:bg-gray-50'
      $c = $c -replace 'hover:text-amber-950', 'hover:text-gray-900'
      # Fix dark gradient admin backgrounds
      $c = $c -replace 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950', 'bg-gray-50'
      $c = $c -replace 'bg-gradient-to-br from-amber-50 to-orange-50', 'bg-gray-50'
      # Fix black text backgrounds
      $c = $c -replace 'min-h-screen bg-white text-black', 'min-h-screen bg-gray-50'
      # Fix purple placeholders
      $c = $c -replace 'placeholder:text-purple-600', 'placeholder:text-gray-400'
      # Fix remaining bright purple text
      $c = $c -replace 'text-purple-600', 'text-blue-600'
      # Fix amber card backgrounds (various spacing patterns)
      $c = $c -replace 'bg-amber-100/50  border-gray-200', 'bg-white border-gray-200'
      $c = $c -replace 'bg-amber-100/50 border-gray-200', 'bg-white border-gray-200'
      $c = $c -replace 'bg-amber-50/20 border-gray-200', 'bg-white border-gray-200'
      $c = $c -replace '"bg-amber-100/50"', '"bg-white"'
      # Fix amber select backgrounds
      $c = $c -replace 'bg-amber-100/50 border border-amber-200/60 rounded-lg px-4 py-2 text-gray-900', 'border border-gray-200 rounded-lg px-4 py-2 text-gray-900 bg-white'
      # Fix amber select inline style 
      $c = $c -replace 'bg-amber-100/50 border border-gray-200 rounded-lg', 'bg-white border border-gray-200 rounded-lg'
      # Fix amber input style
      $c = $c -replace 'bg-amber-100/50 border-gray-200 text-gray-900 placeholder:text-gray-400', 'bg-white border-gray-200 text-gray-900'
      # Fix amber badge button 
      $c = $c -replace 'bg-amber-100/50 text-gray-900 border-gray-200', 'bg-white text-gray-900 border-gray-200'
      # Fix amber buttons
      $c = $c -replace 'bg-amber-100/50 text-gray-900 border-gray-200 hover:bg-gray-50', 'hover:bg-gray-50 text-gray-900 border-gray-200'

      if ($original -ne $c) {
        Set-Content $path $c -Encoding UTF8
        Write-Host "Updated: $path"
      }
    }
  }
}
