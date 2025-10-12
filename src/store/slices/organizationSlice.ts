import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Member {
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  role: 'admin' | 'member';
  joinedAt: string;
}

interface Invitation {
  email: string;
  invitedBy: {
    _id: string;
    username: string;
    email: string;
  };
  invitedAt: string;
  status: 'pending' | 'accepted';
}

interface Organization {
  _id: string;
  name: string;
  members: Member[];
  invitations: Invitation[];
  createdAt: string;
  updatedAt: string;
}

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
}

const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  loading: false
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganizations: (state, action: PayloadAction<Organization[]>) => {
      state.organizations = action.payload;
    },
    setCurrentOrganization: (state, action: PayloadAction<Organization>) => {
      state.currentOrganization = action.payload;
    },
    addOrganization: (state, action: PayloadAction<Organization>) => {
      state.organizations.push(action.payload);
    },
    updateOrganization: (state, action: PayloadAction<Organization>) => {
      const index = state.organizations.findIndex(org => org._id === action.payload._id);
      if (index !== -1) {
        state.organizations[index] = action.payload;
      }
      if (state.currentOrganization?._id === action.payload._id) {
        state.currentOrganization = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setOrganizations,
  setCurrentOrganization,
  addOrganization,
  updateOrganization,
  setLoading
} = organizationSlice.actions;

export default organizationSlice.reducer;
