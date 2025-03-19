import MemberRegistrationForm from "@/components/member-registration-form";
import { Box, Typography, Container } from "@mui/material";
import Image from "next/image";

export default function Home() {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 4,
        }}
      >
        {/* Logo at the top */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={180}
            height={140}
            priority
          />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Member Registration
        </Typography>

        <Box sx={{ width: "100%", maxWidth: "600px", mx: "auto" }}>
          <MemberRegistrationForm />
        </Box>
      </Box>
    </Container>
  );
}
