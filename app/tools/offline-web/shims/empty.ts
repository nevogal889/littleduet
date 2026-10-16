// intentionally empty (native-only module in the offline web preview)
export default {};
export const createClient = () => {
  throw new Error('Supabase is off in the offline preview');
};
