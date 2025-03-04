import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  styled,
  IconButton,
  Rating,
  Chip,
  Select,
  MenuItem,
  TextField
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { TbBlocks, TbAffiliate, TbHistoryToggle, TbBrandGit } from "react-icons/tb";

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
  const [nodeInfo, setNodeInfo] = React.useState<any>(null);

  async function getNodeInfo() {
    try {
      const inf1 = await fetch("/admin/info");
      const infRes1 = await inf1.json();
      console.log("RES1", infRes1);

      const inf2 = await fetch("/admin/status");
      const infRes2 = await inf2.json();
      console.log("RES2", infRes2);

      return { ...infRes1, ...infRes2 };
    } catch (error) {
    }
  }

  React.useEffect(() => {
    let infoTimeoutId: number;
    (async () => {
      const infos = await getNodeInfo();
      setNodeInfo(infos);
      console.log("NODE INFO", nodeInfo);
      infoTimeoutId = setTimeout(async () => {
        const infos = await getNodeInfo();
        setNodeInfo(infos);
        console.log("NODE INFO", nodeInfo);
      }, 120000);
    })();
    return () => {
      clearTimeout(infoTimeoutId);
    };
  }, []);

  console.log("NODE INFO", nodeInfo);

  const features = [
    { icon: <TbBlocks size={32} />, title: "BLOCK HEIGHT", description: "BLOCK HEIGHT" },
    { icon: <TbAffiliate size={32} />, title: "CONNECTED PEERS", description: "CONNECTED PEERS" },
    { icon: <TbHistoryToggle size={32} />, title: "NODE UPTIME", description: "NODE UPTIME" },
    { icon: <TbBrandGit size={32} />, title: "CORE VERSION", description: "CORE VERSION" }
  ];

  return (
    <Box>
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h3" gutterBottom align="center">
          Welcome To <span style={{ color: '#60d0fd' }}>Multi</span> <span style={{ color: '#05a2e4' }}>Wallet</span> <span style={{ color: '#02648d' }}>App</span>!
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
            Features
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomePage;