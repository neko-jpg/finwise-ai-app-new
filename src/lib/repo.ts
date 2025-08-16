import { Timestamp, FirestoreDataConverter, DocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import {
    TransactionSchema, type Transaction,
    FamilySchema, type Family,
    AppUserSchema, type AppUser,
    BudgetSchema, type Budget
} from "@/domain";

// --- Transaction Converter ---
const txFromDoc = (doc: DocumentSnapshot): Transaction => {
    const rawData: Record<string, any> = { id: doc.id, ...doc.data() };
    const dateFields = ['bookedAt', 'createdAt', 'updatedAt', 'deletedAt', 'clientUpdatedAt'];
    for (const field of dateFields) {
        if (rawData[field] && rawData[field] instanceof Timestamp) {
            rawData[field] = rawData[field].toDate();
        }
    }
    return TransactionSchema.parse(rawData);
};

const txToDoc = (tx: Partial<Transaction>): Record<string, any> => {
    const data: Record<string, any> = { ...tx };
    const dateFields = ['bookedAt', 'createdAt', 'updatedAt', 'deletedAt', 'clientUpdatedAt'];
    for (const field of dateFields) {
        if (data[field] && data[field] instanceof Date) {
            data[field] = Timestamp.fromDate(data[field]);
        }
    }
    delete data.id;
    return data;
};

export const txConverter: FirestoreDataConverter<Transaction> = {
  toFirestore: (tx: Transaction) => txToDoc(tx),
  fromFirestore: (snapshot: DocumentSnapshot, _options: SnapshotOptions) => txFromDoc(snapshot)
};


// --- Family Converter ---
const familyFromDoc = (doc: DocumentSnapshot): Family => {
    const rawData: Record<string, any> = { id: doc.id, ...doc.data() };
    if (rawData.createdAt && rawData.createdAt instanceof Timestamp) {
        rawData.createdAt = rawData.createdAt.toDate();
    }
    return FamilySchema.parse(rawData);
};

const familyToDoc = (family: Partial<Family>): Record<string, any> => {
    const data: Record<string, any> = { ...family };
    if (data.createdAt && data.createdAt instanceof Date) {
        data.createdAt = Timestamp.fromDate(data.createdAt);
    }
    delete data.id;
    return data;
};

export const familyConverter: FirestoreDataConverter<Family> = {
  toFirestore: (family: Family) => familyToDoc(family),
  fromFirestore: (snapshot: DocumentSnapshot, _options: SnapshotOptions) => familyFromDoc(snapshot)
};

// --- AppUser Converter ---
const userFromDoc = (doc: DocumentSnapshot): AppUser => {
    const rawData: Record<string, any> = { uid: doc.id, ...doc.data() };
     if (rawData.createdAt && rawData.createdAt instanceof Timestamp) {
        rawData.createdAt = rawData.createdAt.toDate();
    }
    if (rawData.updatedAt && rawData.updatedAt instanceof Timestamp) {
        rawData.updatedAt = rawData.updatedAt.toDate();
    }
    return AppUserSchema.parse(rawData);
};

const userToDoc = (user: Partial<AppUser>): Record<string, any> => {
    const data: Record<string, any> = { ...user };
    if (data.createdAt && data.createdAt instanceof Date) {
        data.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt && data.updatedAt instanceof Date) {
        data.updatedAt = Timestamp.fromDate(data.updatedAt);
    }
    delete data.uid; // In our case, uid is the doc id
    return data;
};

export const userConverter: FirestoreDataConverter<AppUser> = {
  toFirestore: (user: AppUser) => userToDoc(user),
  fromFirestore: (snapshot: DocumentSnapshot, _options: SnapshotOptions) => userFromDoc(snapshot)
};

// --- Budget Converter ---
const budgetFromDoc = (doc: DocumentSnapshot): Budget => {
    const rawData: Record<string, any> = { id: doc.id, ...doc.data() };
    if (rawData.createdAt && rawData.createdAt instanceof Timestamp) {
        rawData.createdAt = rawData.createdAt.toDate();
    }
    if (rawData.updatedAt && rawData.updatedAt instanceof Timestamp) {
        rawData.updatedAt = rawData.updatedAt.toDate();
    }
    return BudgetSchema.parse(rawData);
};

const budgetToDoc = (budget: Partial<Budget>): Record<string, any> => {
    const data: Record<string, any> = { ...budget };
    if (data.createdAt && data.createdAt instanceof Date) {
        data.createdAt = Timestamp.fromDate(data.createdAt);
    }
    if (data.updatedAt && data.updatedAt instanceof Date) {
        data.updatedAt = Timestamp.fromDate(data.updatedAt);
    }
    delete data.id;
    return data;
};

export const budgetConverter: FirestoreDataConverter<Budget> = {
  toFirestore: (budget: Budget) => budgetToDoc(budget),
  fromFirestore: (snapshot: DocumentSnapshot, _options: SnapshotOptions) => budgetFromDoc(snapshot)
};
