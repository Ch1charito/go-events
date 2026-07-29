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
    private readonly injector = inject(Injector);
    private readonly auth = inject(Auth);
    private readonly firestore = inject(Firestore);

    /** Firebase-User als Signal: null = Gast */
    readonly user = toSignal(this.run(() => user(this.auth)), { initialValue: null });
    readonly isLoggedIn = computed(() => this.user() !== null);

    async register(email: string, password: string, displayName: string): Promise<void> {
        const credential = await this.run(() =>
            createUserWithEmailAndPassword(this.auth, email, password),
        );
        await this.run(() => updateProfile(credential.user, { displayName }));
        await this.createUserDocument(credential.user.uid, displayName, email);
    }

    async login(email: string, password: string): Promise<void> {
        await this.run(() => signInWithEmailAndPassword(this.auth, email, password));
    }

    async loginWithGoogle(): Promise<void> {
        const credential = await this.run(() =>
            signInWithPopup(this.auth, new GoogleAuthProvider()),
        );
        const userDoc = await this.run(() =>
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
        await this.run(() => signOut(this.auth));
    }

    private async createUserDocument(uid: string, displayName: string, email: string): Promise<void> {
        const newUser: GoUser = {
            uid,
            displayName,
            email,
            createdAt: new Date().toISOString(),
            tagScores: {},
        };
        await this.run(() => setDoc(doc(this.firestore, 'users', uid), newUser));
    }

    /**
     * Führt einen Firebase-Aufruf im Angular-Injection-Kontext aus.
     * Nötig, weil der Kontext nach jedem `await` und in Event-Handlern
     * verloren geht – @angular/fire warnt sonst und Change Detection
     * kann in Randfällen hängen.
     */
    private run<T>(fn: () => T): T {
        return runInInjectionContext(this.injector, fn);
    }
}