// E-SAGE Data Store — localStorage-backed

export type UserRole = 'citizen' | 'worker' | 'admin';
export type AreaCategory = 'urban' | 'rural' | 'high-density';
export type ReportStatus = 'pending' | 'resolved';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  street: string;
  category: AreaCategory;
  points: number;
}

export interface Street {
  name: string;
  category: AreaCategory;
  totalScore: number;
  markCount: number;
}

export interface Report {
  id: string;
  citizenId: string;
  citizenName: string;
  street: string;
  description: string;
  photoUrl: string;
  status: ReportStatus;
  createdAt: string;
}

export interface Winner {
  month: string;
  street: string;
  category: AreaCategory;
  score: number;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'report_resolved' | 'winner_announced';
  read: boolean;
  createdAt: string;
}


const KEYS = {
  users: 'esage_users',
  streets: 'esage_streets',
  reports: 'esage_reports',
  winners: 'esage_winners',
  notifications: 'esage_notifications',
  currentUser: 'esage_current_user',
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Seed Data ---
const SEED_STREETS: Street[] = [
  { name: 'Anna Nagar Main Road', category: 'urban', totalScore: 45, markCount: 3 },
  { name: 'T. Nagar Pondy Bazaar', category: 'urban', totalScore: 38, markCount: 3 },
  { name: 'Thanjavur Mariyamman Kovil Street', category: 'rural', totalScore: 52, markCount: 4 },
  { name: 'Madurai Meenakshi Street', category: 'rural', totalScore: 30, markCount: 2 },
  { name: 'Ranganathan Street', category: 'high-density', totalScore: 60, markCount: 4 },
  { name: 'Trichy Chathiram Bus Stand Road', category: 'high-density', totalScore: 48, markCount: 3 },
];

const SEED_USERS: User[] = [
  { id: 'c1', username: 'tamilselvi', role: 'citizen', street: 'Anna Nagar Main Road', category: 'urban', points: 35 },
  { id: 'c2', username: 'murugan', role: 'citizen', street: 'T. Nagar Pondy Bazaar', category: 'urban', points: 22 },
  { id: 'c3', username: 'kavitha', role: 'citizen', street: 'Thanjavur Mariyamman Kovil Street', category: 'rural', points: 40 },
  { id: 'c4', username: 'senthil', role: 'citizen', street: 'Ranganathan Street', category: 'high-density', points: 28 },
  { id: 'w1', username: 'karthik', role: 'worker', street: 'Anna Nagar Main Road', category: 'urban', points: 0 },
  { id: 'a1', username: 'admin', role: 'admin', street: 'Ranganathan Street', category: 'high-density', points: 0 },
];

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

const SEED_REPORTS: Report[] = [
  { id: 'r1', citizenId: 'c1', citizenName: 'tamilselvi', street: 'Anna Nagar Main Road', description: 'Illegal dumping near park entrance', photoUrl: '', status: 'pending', createdAt: daysAgo(0) },
  { id: 'r2', citizenId: 'c2', citizenName: 'murugan', street: 'T. Nagar Pondy Bazaar', description: 'Overflowing bin at corner', photoUrl: '', status: 'resolved', createdAt: daysAgo(3) },
  { id: 'r3', citizenId: 'c1', citizenName: 'tamilselvi', street: 'Anna Nagar Main Road', description: 'Plastic waste in drain', photoUrl: '', status: 'resolved', createdAt: daysAgo(7) },
  { id: 'r4', citizenId: 'c3', citizenName: 'kavitha', street: 'Thanjavur Mariyamman Kovil Street', description: 'Burning waste behind school', photoUrl: '', status: 'pending', createdAt: daysAgo(10) },
  { id: 'r5', citizenId: 'c4', citizenName: 'senthil', street: 'Ranganathan Street', description: 'Construction debris on sidewalk', photoUrl: '', status: 'resolved', createdAt: daysAgo(14) },
  { id: 'r6', citizenId: 'c2', citizenName: 'murugan', street: 'T. Nagar Pondy Bazaar', description: 'E-waste dumped in empty lot', photoUrl: '', status: 'resolved', createdAt: daysAgo(20) },
  { id: 'r7', citizenId: 'c3', citizenName: 'kavitha', street: 'Thanjavur Mariyamman Kovil Street', description: 'Hazardous waste near river', photoUrl: '', status: 'pending', createdAt: daysAgo(25) },
  { id: 'r8', citizenId: 'c1', citizenName: 'tamilselvi', street: 'Anna Nagar Main Road', description: 'Unsegregated waste pile', photoUrl: '', status: 'resolved', createdAt: daysAgo(30) },
];

export function initStore() {
  if (!localStorage.getItem(KEYS.streets)) set(KEYS.streets, SEED_STREETS);
  if (!localStorage.getItem(KEYS.users)) set(KEYS.users, SEED_USERS);
  if (!localStorage.getItem(KEYS.reports)) set(KEYS.reports, SEED_REPORTS);
  if (!localStorage.getItem(KEYS.winners)) set(KEYS.winners, []);
  if (!localStorage.getItem(KEYS.notifications)) set(KEYS.notifications, []);
}

// --- Users ---
export function getUsers(): User[] { return get(KEYS.users, []); }
export function getUser(id: string): User | undefined { return getUsers().find(u => u.id === id); }
export function findUser(username: string, role: UserRole): User | undefined {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase() && u.role === role);
}
export function createUser(username: string, role: UserRole, street: string, category: AreaCategory): User {
  const users = getUsers();
  const id = `${role[0]}${Date.now()}`;
  const user: User = { id, username, role, street, category, points: 0 };
  users.push(user);
  set(KEYS.users, users);
  return user;
}
export function updateUserPoints(userId: string, points: number) {
  const users = getUsers();
  const u = users.find(x => x.id === userId);
  if (u) { u.points += points; set(KEYS.users, users); }
}

// --- Streets ---
export function getStreets(): Street[] { return get(KEYS.streets, []); }
export function getStreetsByCategory(cat: AreaCategory): Street[] { return getStreets().filter(s => s.category === cat); }
export function addMarksToStreet(streetName: string, marks: number) {
  const streets = getStreets();
  const s = streets.find(x => x.name === streetName);
  if (s) { s.totalScore += marks; s.markCount += 1; set(KEYS.streets, streets); }
}
export function getStreetAvg(s: Street): number {
  return s.markCount > 0 ? Math.round((s.totalScore / s.markCount) * 10) / 10 : 0;
}

// --- Reports ---
export function getReports(): Report[] { return get(KEYS.reports, []); }
export function addReport(report: Omit<Report, 'id' | 'createdAt' | 'status'>) {
  const reports = getReports();
  reports.push({ ...report, id: `r${Date.now()}`, status: 'pending', createdAt: new Date().toISOString() });
  set(KEYS.reports, reports);
}
export function resolveReport(id: string) {
  const reports = getReports();
  const r = reports.find(x => x.id === id);
  if (r) {
    r.status = 'resolved';
    set(KEYS.reports, reports);
    addNotification(r.citizenId, `Your report on "${r.street}" has been resolved! ✅`, 'report_resolved');
  }
}

// --- Winners ---
export function getWinners(): Winner[] { return get(KEYS.winners, []); }
export function declareWinner(month: string, street: string, category: AreaCategory, score: number) {
  const winners = getWinners();
  winners.push({ month, street, category, score });
  set(KEYS.winners, winners);
  // Notify all citizens in the winning street
  const citizens = getUsers().filter(u => u.role === 'citizen' && u.street === street);
  citizens.forEach(c => {
    addNotification(c.id, `🏆 Your street "${street}" won the ${month} award for ${category} category!`, 'winner_announced');
  });
  // Also notify all citizens about the winner announcement
  const otherCitizens = getUsers().filter(u => u.role === 'citizen' && u.street !== street);
  otherCitizens.forEach(c => {
    addNotification(c.id, `🏆 "${street}" is the ${month} winner in ${category} category with score ${score}!`, 'winner_announced');
  });
}

// --- Session ---
export function setCurrentUser(user: User) { set(KEYS.currentUser, user); }
export function getCurrentUser(): User | null { return get(KEYS.currentUser, null); }
export function clearCurrentUser() { localStorage.removeItem(KEYS.currentUser); }

// --- Notifications ---
export function getNotifications(): Notification[] { return get(KEYS.notifications, []); }
export function getUserNotifications(userId: string): Notification[] {
  return getNotifications().filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export function addNotification(userId: string, message: string, type: Notification['type']) {
  const notifications = getNotifications();
  notifications.push({ id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`, userId, message, type, read: false, createdAt: new Date().toISOString() });
  set(KEYS.notifications, notifications);
}
export function markNotificationRead(id: string) {
  const notifications = getNotifications();
  const n = notifications.find(x => x.id === id);
  if (n) { n.read = true; set(KEYS.notifications, notifications); }
}
export function markAllNotificationsRead(userId: string) {
  const notifications = getNotifications();
  notifications.filter(n => n.userId === userId).forEach(n => { n.read = true; });
  set(KEYS.notifications, notifications);
}

// --- All street names ---
export function getAllStreetNames(): string[] { return getStreets().map(s => s.name); }
export function getAllCategories(): AreaCategory[] { return ['urban', 'rural', 'high-density']; }
