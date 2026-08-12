import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

export interface FeedbackEntry {
    text: string;
    uid: string;
    displayName: string;
    email: string;
    createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
    private readonly injector = inject(Injector);
    private readonly firestore = inject(Firestore);
    private readonly authService = inject(AuthService);

    async submit(text: string): Promise<void> {
        const user = this.authService.user();
        if (!user) throw new Error('Nicht eingeloggt.');

        const entry: FeedbackEntry = {
            text,
            uid: user.uid,
            displayName: user.displayName ?? 'Unbekannt',
            email: user.email ?? '',
            createdAt: new Date().toISOString(),
        };

        await runInInjectionContext(this.injector, () =>
            addDoc(collection(this.firestore, 'feedback'), entry),
        );
    }
}