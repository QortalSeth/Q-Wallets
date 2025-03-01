import QRCode from "react-qr-code";
import { Box } from "@mui/material";

export const addressToQRC = ({ targetAddress }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexDirection: "column",
        marginTop: '10px'
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            width: "100%",
            alignItems: "center",
            flexDirection: "column",
            marginTop: "20px",
          }}
        >
          <QRCode
            value={targetAddress}
            size={150}
            level="M"
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </Box>
      </Box>
    </Box>
  );
};