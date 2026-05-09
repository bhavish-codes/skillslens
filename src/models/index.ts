import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'recruiter' | 'candidate';
  name: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['recruiter', 'candidate'], default: 'recruiter' },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export interface IInterview extends Document {
  recruiterId: mongoose.Types.ObjectId;
  title: string;
  role: string;
  questions: Array<{
    id: string;
    text: string;
    skill: string;
    timeLimit: number;
  }>;
  type: 'video' | 'chat' | 'both';
  linkToken: string;
  createdAt: Date;
}

const InterviewSchema: Schema = new Schema({
  recruiterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  role: { type: String, required: true },
  questions: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    skill: { type: String, required: true },
    timeLimit: { type: Number, required: true },
  }],
  type: { type: String, enum: ['video', 'chat', 'both'], default: 'video' },
  linkToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export const Interview = mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

export interface ISession extends Document {
  interviewId: mongoose.Types.ObjectId;
  candidateEmail: string;
  candidateName: string;
  status: 'pending' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

const SessionSchema: Schema = new Schema({
  interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true },
  candidateEmail: { type: String, required: true },
  candidateName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  startedAt: { type: Date },
  completedAt: { type: Date },
});

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export interface IResponse extends Document {
  sessionId: mongoose.Types.ObjectId;
  questionIndex: number;
  videoUrl?: string;
  transcript: string;
  duration: number;
}

const ResponseSchema: Schema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  questionIndex: { type: Number, required: true },
  videoUrl: { type: String },
  transcript: { type: String, required: true },
  duration: { type: Number, required: true },
});

export const Response = mongoose.models.Response || mongoose.model<IResponse>('Response', ResponseSchema);

export interface IReport extends Document {
  sessionId: mongoose.Types.ObjectId;
  overallScore: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  technical: number;
  culturalFit: number;
  sentiment: string;
  insights: Array<{ type: 'strength' | 'improvement', text: string }>;
  status: 'processing' | 'ready';
  recruiterAction: 'shortlist' | 'reject' | 'flag' | null;
}

const ReportSchema: Schema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  overallScore: { type: Number, required: true },
  communication: { type: Number, required: true },
  problemSolving: { type: Number, required: true },
  confidence: { type: Number, required: true },
  technical: { type: Number, required: true },
  culturalFit: { type: Number, required: true },
  sentiment: { type: String, required: true },
  insights: [{
    type: { type: String, enum: ['strength', 'improvement'] },
    text: { type: String }
  }],
  status: { type: String, enum: ['processing', 'ready'], default: 'processing' },
  recruiterAction: { type: String, enum: ['shortlist', 'reject', 'flag', null], default: null },
});

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
