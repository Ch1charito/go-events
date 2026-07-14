import { Injectable, computed, inject, Injector, runInInjectionContext } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    Auth,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    user,
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { GoUser } from '../models/user.model';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly auth = inject(Auth);
    private readonly firestore = inject(Firestore);
    private readonly injector = inject(Injector);

    /** Firebase-User als Signal: null = Gast */
    readonly user = toSignal(user(this.auth), { initialValue: null });
    readonly isLoggedIn = computed(() => this.user() !== null);

    async register(email: string, password: string, displayName: string): Promise<void> {
        const credential = await createUserWithEmailAndPassword(this.auth, email, password);
        await updateProfile(credential.user, { displayName });
        await this.createUserDocument(credential.user.uid, displayName, email);
    }

    async login(email: string, password: string): Promise<void> {
        await signInWithEmailAndPassword(this.auth, email, password);
    }

    async loginWithGoogle(): Promise<void> {
        const credential = await signInWithPopup(this.auth, new GoogleAuthProvider());
        const userDoc = await runInInjectionContext(this.injector, () =>
            getDoc(doc(this.firestore, 'users', credential.user.uid)),
        );
        if (!userDoc.exists()) {
            await this.createUserDocument(
                credential.user.uid,
                credential.user.displayName ?? 'Nutzer',
                credential.user.email ?? '',
            );
        }
    }

    async logout(): Promise<void> {
        await signOut(this.auth);
    }

    private async createUserDocument(uid: string, displayName: string, email: string): Promise<void> {
        const newUser: GoUser = {
            uid,
            displayName,
            email,
            createdAt: new Date().toISOString(),
            tagScores: {},
        };
        await runInInjectionContext(this.injector, () =>
            setDoc(doc(this.firestore, 'users', uid), newUser),
        );
    }
}