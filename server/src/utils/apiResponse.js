export const ok = (res, data = {}, meta = {}) => res.json({ success: true, data, meta })
export const created = (res, data = {}, meta = {}) => res.status(201).json({ success: true, data, meta })
export const fail = (res, status, message, errors) => res.status(status).json({ success: false, message, errors })
