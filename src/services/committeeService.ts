import { api } from './api';

export interface CommitteeMember {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phoneNumber: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    role?: 'COMMITTEE_CHAIRMAN' | 'COMMITTEE_MEMBER';
    createdAt: string;
}

export interface Committee {
    id: string;
    name: string;
    members: CommitteeMember[];
    chairman?: CommitteeMember | null;
    createdAt: string;
}

export interface CreateCommitteeMemberRequest {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    phoneNumber?: string;
}

/** There is exactly one Approval Committee, system-wide — Director of Operations gets read-only visibility into it. */
const getCommitteeForDirectorOperations = async (): Promise<Committee> => {
    const response = await api.get('/internal/bureau/committee');
    return response.data;
};

/** Super Admin owns membership — adding/viewing members of the one committee. */
const getCommitteeForSuperAdmin = async (): Promise<Committee> => {
    const response = await api.get('/super-admin/committee');
    return response.data;
};

const addCommitteeMember = async (request: CreateCommitteeMemberRequest): Promise<CommitteeMember> => {
    const response = await api.post('/super-admin/committee/members', request);
    return response.data;
};

const addCommitteeChairman = async (request: CreateCommitteeMemberRequest): Promise<CommitteeMember> => {
    const response = await api.post('/super-admin/committee/chairman', request);
    return response.data;
};

export const committeeService = {
    getCommitteeForDirectorOperations,
    getCommitteeForSuperAdmin,
    addCommitteeMember,
    addCommitteeChairman,
};
