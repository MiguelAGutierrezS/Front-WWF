export const getAnonSessionId = () => {
  let anonId = localStorage.getItem('wwf_anon_session_id');
  if (!anonId) {
    anonId = crypto.randomUUID();
    localStorage.setItem('wwf_anon_session_id', anonId);
  }
  return anonId;
};

export const clearAnonSessionId = () => {
  localStorage.removeItem('wwf_anon_session_id');
};
