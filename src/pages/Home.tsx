import { Typography, Grid } from '@mui/material';
import NodeWidget from '../components/NodeWidget';
import { AltRoute, GridView, HistoryToggleOff, Hub } from '@mui/icons-material';
import { secondsToDhms } from '../common/functions';

export default function Home({ nodeInfo }: { nodeInfo?: any }) {
  const features = [
    { icon: GridView, title: nodeInfo?.height, description: 'BLOCK HEIGHT' },
    {
      icon: Hub,
      title: nodeInfo?.numberOfConnections,
      description: 'CONNECTED PEERS',
    },
    {
      icon: HistoryToggleOff,
      title: secondsToDhms((nodeInfo?.uptime ?? 0) / 1000),
      description: 'NODE UPTIME',
    },
    {
      icon: AltRoute,
      title: nodeInfo?.buildVersion?.replace('qortal-', 'v'),
      description: 'CORE VERSION',
    },
  ];

  return (
    <>
      <Typography variant="h3" gutterBottom align="center">
        Welcome To <span style={{ color: '#60d0fd' }}>Qortal</span>{' '}
        <span style={{ color: '#05a2e4' }}>Wallets</span>{' '}
        <span style={{ color: '#02648d' }}>App</span>!
      </Typography>

      <Typography variant="h4" gutterBottom align="center">
        Qortal Node Information
      </Typography>

      <Grid
        container
        spacing={4}
        sx={{ mt: 4 }}
        justifyContent="center"
        alignItems="flex-start"
      >
        {features.map((f, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <NodeWidget
              icon={f.icon}
              title={f.title ?? '-'}
              subtitle={f.description}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
