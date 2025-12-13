import { db } from "./database";

export type PlanTier = 'free' | 'pro' | 'team';

export const subscriptionService = {
    getPlan: async (teamId: string): Promise<PlanTier> => {
        // In production, join with subscriptions table
        // For MVP, defaulting to 'free' unless hardcoded or in workspace table
        const workspace = await db.getWorkspace(teamId);
        // @ts-ignore - 'plan' generic check or mocked
        return (workspace?.plan as PlanTier) || 'free';
    },

    canAccessFeature: async (teamId: string, feature: 'forecast' | 'history_unlimited'): Promise<boolean> => {
        const plan = await subscriptionService.getPlan(teamId);
        if (plan === 'team') return true;
        if (plan === 'pro' && feature === 'forecast') return true;
        return false;
    },

    generateCheckoutLink: (teamId: string, targetPlan: PlanTier) => {
        // Mock Stripe Link
        return `https://checkout.stripe.com/mock-checkout?team=${teamId}&plan=${targetPlan}`;
    }
};
