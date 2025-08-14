
'use client';

import React from "react";
import { useAuthState } from "@/hooks/use-auth-state";
import { AppContainer } from "@/components/finwise/app-container";
import { usePathname } from 'next/navigation';
import { HomeDashboard } from "./home-dashboard";
import { TransactionsScreen } from "./transactions-screen";
import { BudgetScreen } from "./budget-screen";
import { GoalsScreen } from "./goals-screen";
import { ProfileScreen } from "./profile-screen";
import { SubscriptionsScreen } from "@/app/subscriptions/page";
import { ReviewsScreen } from "@/app/reviews/page";
import LinkScreen from "@/app/link/page";

export default function AppContainerWrapper() {
    const { user } = useAuthState();
    const pathname = usePathname();

    if (!user) {
        // This can be a loading spinner or some fallback UI
        return null;
    }

    const renderContent = () => {
      switch (pathname) {
        case '/':
          return <AppContainer user={user}><HomeDashboard transactions={[]} budget={null} todaySpend={0} monthUsed={0} monthLimit={0} setTab={() => {}} onOpenTransactionForm={() => {}} onOpenOcr={() => {}} onOpenGoalForm={() => {}} /></AppContainer>;
        case '/transactions':
          return <AppContainer user={user}><TransactionsScreen q="" setQ={() => {}} filteredTx={[]} catFilter={null} setCatFilter={() => {}} loading={false} transactions={[]} /></AppContainer>;
        case '/budget':
            return <AppContainer user={user}><BudgetScreen uid={user.uid} budget={null} loading={false} transactions={[]} goals={[]} /></AppContainer>;
        case '/goals':
            return <AppContainer user={user}><GoalsScreen uid={user.uid} goals={[]} loading={false} onOpenGoalForm={() => {}} /></AppContainer>;
        case '/subscriptions':
            return <AppContainer user={user}><SubscriptionsScreen transactions={[]} /></AppContainer>;
        case '/reviews':
            return <AppContainer user={user}><ReviewsScreen transactions={[]} /></AppContainer>;
        case '/link':
            return <AppContainer user={user}><LinkScreen /></AppContainer>;
        case '/profile':
            return <AppContainer user={user}><ProfileScreen user={user} offline={false} setOffline={() => {}} /></AppContainer>;
        default:
          return <AppContainer user={user}><HomeDashboard transactions={[]} budget={null} todaySpend={0} monthUsed={0} monthLimit={0} setTab={() => {}} onOpenTransactionForm={() => {}} onOpenOcr={() => {}} onOpenGoalForm={() => {}} /></AppContainer>;
      }
    };
    
    return renderContent();
}
