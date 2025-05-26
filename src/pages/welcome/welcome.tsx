import * as React from "react";
import WalletContext from '../../contexts/walletContext';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  styled
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { TbBlocks, TbAffiliate, TbHistoryToggle, TbBrandGit } from "react-icons/tb";
import { secondsToDhms } from "../../common/functions";

const FeatureCard = styled(Card)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s",
  "&:hover": {
    transform: "translateY(-5px)"
  }
}));

function WelcomePage() {
  const { nodeInfo, isAuthenticated } = React.useContext(WalletContext);

  const features = [
    { icon: <TbBlocks size={32} />, title: nodeInfo?.height, description: "BLOCK HEIGHT" },
    { icon: <TbAffiliate size={32} />, title: nodeInfo?.numberOfConnections, description: "CONNECTED PEERS" },
    { icon: <TbHistoryToggle size={32} />, title: secondsToDhms(nodeInfo?.uptime / 1000), description: "NODE UPTIME" },
    { icon: <TbBrandGit size={32} />, title: nodeInfo?.buildVersion.replace('qortal-', 'v'), description: "CORE VERSION" }
  ];

  return (
    <Box>
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h3" gutterBottom align="center">
          Welcome To <span style={{ color: '#60d0fd' }}>Qortal</span> <span style={{ color: '#05a2e4' }}>Wallets</span> <span style={{ color: '#02648d' }}>App</span>!
        </Typography>
        <Typography variant="h4" gutterBottom align="center">
          Qortal Node Information
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <FeatureCard>
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" gutterBottom align="center">
            {isAuthenticated ? '' : 'Please sign in to use Qortal Wallets.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomePage;
