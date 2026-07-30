import { vi } from 'vitest';
import type { GymClass, Member, Trainer } from '../data/types';

/**
 * Component tests exercise real UI behavior (typing, clicking, form submission)
 * against a fake backend instead of a live server + MySQL instance — that would
 * make the suite slow and non-deterministic. This in-memory fake implements just
 * the endpoints the current tests actually call.
 */

const DEMO_PASSWORD = 'vulkan2026';

let members: Member[];
let trainers: Trainer[];
let classes: GymClass[];

export function resetMockData() {
  trainers = [
    { id: 't1', name: 'Marco Díaz', email: 'marco.diaz@vulkangym.com', avatar: '', specialty: 'Fuerza', bio: '', activeStudents: 1 },
  ];
  members = [
    {
      id: 'm1',
      name: 'Andrés Reyes',
      email: 'andres.reyes@gmail.com',
      avatar: '',
      plan: 'Pro',
      status: 'activa',
      joinDate: '2023-02-10',
      nextPaymentDate: '2026-08-05',
      monthlyFee: 49,
      checkIns: 10,
      trainerId: 't1',
      currentStreakDays: 1,
      weightGoalKg: 80,
      weightHistory: [],
      emergencyContact: { name: '', phone: '', relationship: '' },
      bodyMeasurements: [],
      progressPhotos: [],
      freezeRequest: null,
    },
  ];
  classes = [
    {
      id: 'c1',
      name: 'Hipertrofia Piernas',
      category: 'Hipertrofia',
      trainerId: 't1',
      day: 'Lun',
      startTime: '17:00',
      durationMin: 60,
      capacity: 12,
      bookedIds: [],
      waitlistIds: [],
      attendedIds: [],
    },
  ];
}

function ok(body: unknown, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function error(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
}

function sessionFor(email: string) {
  if (email === 'admin@vulkangym.com') return { role: 'admin', name: 'Staff VULKAN', avatar: '' };
  const member = members.find((m) => m.email === email);
  if (member) return { role: 'member', name: member.name, avatar: member.avatar, memberId: member.id };
  return null;
}

export function installMockApi() {
  resetMockData();

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string | URL, init?: RequestInit) => {
      const url = new URL(input.toString());
      const path = url.pathname;
      const method = (init?.method ?? 'GET').toUpperCase();
      const body = init?.body ? JSON.parse(init.body as string) : undefined;

      if (path === '/auth/login' && method === 'POST') {
        if (body.password !== DEMO_PASSWORD) return error(401, 'Correo o contraseña incorrectos.');
        const session = sessionFor(body.email);
        if (!session) return error(401, 'Correo o contraseña incorrectos.');
        return ok({ token: 'fake-token', session });
      }

      if (path === '/members' && method === 'GET') return ok(members);
      if (path === '/members' && method === 'POST') {
        const created: Member = {
          id: `m${members.length + 1}`,
          weightHistory: [],
          bodyMeasurements: [],
          progressPhotos: [],
          freezeRequest: null,
          ...body,
        };
        members = [...members, created];
        return ok(created, 201);
      }
      const memberDeleteMatch = path.match(/^\/members\/([^/]+)$/);
      if (memberDeleteMatch && method === 'DELETE') {
        members = members.filter((m) => m.id !== memberDeleteMatch[1]);
        return ok(undefined, 204);
      }

      if (path === '/trainers' && method === 'GET') return ok(trainers);
      if (path === '/classes' && method === 'GET') return ok(classes);
      if (path === '/payments' && method === 'GET') return ok([]);
      if (path === '/workout-plans' && method === 'GET') return ok([]);
      if (path === '/session-packages' && method === 'GET') return ok([]);
      if (path === '/check-ins' && method === 'GET') return ok([]);
      if (path === '/signup-requests' && method === 'GET') return ok([]);
      if (path === '/audit-log' && method === 'GET') return ok([]);

      const toggleBookingMatch = path.match(/^\/classes\/([^/]+)\/toggle-booking$/);
      if (toggleBookingMatch && method === 'POST') {
        const classId = toggleBookingMatch[1];
        classes = classes.map((c) => {
          if (c.id !== classId) return c;
          const isBooked = c.bookedIds.includes(body.memberId);
          return isBooked
            ? { ...c, bookedIds: c.bookedIds.filter((id) => id !== body.memberId) }
            : { ...c, bookedIds: [...c.bookedIds, body.memberId] };
        });
        return ok(classes.find((c) => c.id === classId));
      }

      throw new Error(`mockApi: unhandled request ${method} ${path}`);
    }),
  );
}
