import * as React from 'react';
import { Outlet } from 'react-router';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';

export default function Layout() {
  const walletTitle = '';
  const title = '';
  const path = '';
  const breadcrumbs = [{ title, path }];

  return (
    <DashboardLayout>
      <PageContainer title={walletTitle} breadcrumbs={breadcrumbs}>
        <Outlet />
      </PageContainer>
    </DashboardLayout>
  );
}