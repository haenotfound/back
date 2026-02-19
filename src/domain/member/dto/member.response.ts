import { AuthProvider } from '@prisma/client';

export type MemberResponse = {
  id: number;
  memberEmail: string;
  memberName: string;
  memberAge: number | null;
  memberAddress: string | null;
  memberCreateAt: Date;
  memberProfile: string | null;
  socials: {
    id: number;
    memberProvider: AuthProvider;
    memberProviderId: string | null;
  }[];
};
