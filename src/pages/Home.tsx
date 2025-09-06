import { Typography, Grid } from '@mui/material';
import NodeWidget from '../components/NodeWidget';
import { AltRoute, GridView, HistoryToggleOff, Hub } from '@mui/icons-material';
import { secondsToDhms } from '../common/functions';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useState, } from 'react';

export default function Home() {
  const { t } = useTranslation(['core']);
  const [nodeInfo, setNodeInfo] = useState<any>(null);

  const features = [
    {
      icon: GridView,
      title: nodeInfo?.height,
      description: t('core:widgets.block_height', {
        postProcess: 'capitalizeAll',
      }),
    },
    {
      icon: Hub,
      title: nodeInfo?.numberOfConnections,
      description: t('core:widgets.connected_peers', {
        postProcess: 'capitalizeAll',
      }),
    },
    {
      icon: HistoryToggleOff,
      title: secondsToDhms((nodeInfo?.uptime ?? 0) / 1000),
      description: t('core:widgets.node_uptime', {
        postProcess: 'capitalizeAll',
      }),
    },
    {
      icon: AltRoute,
      title: nodeInfo?.buildVersion?.replace('qortal-', 'v'),
      description: t('core:widgets.core_version', {
        postProcess: 'capitalizeAll',
      }),
    },
  ];

  async function getNodeInfo() {
    try {
      const nodeInfo = await qortalRequest({
        action: "GET_NODE_INFO",
      });
      const nodeStatus = await qortalRequest({
        action: "GET_NODE_STATUS",
      });
      return { ...nodeInfo, ...nodeStatus };
    } catch (error) {
      console.error(error);
    }
  }

   useEffect(() => {
    let nodeInfoTimeoutId: number;;
    (async () => {
      nodeInfoTimeoutId = setInterval(async () => {
        const infos = await getNodeInfo();
        setNodeInfo(infos);
      }, 60000);
      const infos = await getNodeInfo();
      setNodeInfo(infos);
    })();
    return () => {
      clearInterval(nodeInfoTimeoutId);
    };
  }, []);

  return (
    <>
      <Typography variant="h3" gutterBottom align="center">
        <Trans
          i18nKey="message.generic.welcome"
          ns="core"
          components={{
            brand: <span style={{ color: '#60d0fd' }} />,
          }}
          tOptions={{ postProcess: ['capitalizeFirstChar'] }}
        />
      </Typography>

      <Typography variant="h4" gutterBottom align="center">
        {t('core:message.generic.node_info', {
          postProcess: 'capitalizeEachFirst',
        })}
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
              subtitle={f.title ?? '-'}
              title={f.description}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
