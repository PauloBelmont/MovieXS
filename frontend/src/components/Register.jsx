import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import "../styles/global.css";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from "@mui/material";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, login } = useContext(AuthContext); // Pegando do contexto

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/user/home"); // Redireciona se já estiver autenticado
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
      });

      alert("Registro bem-sucedido!");

      // Após registro, faz login automático
      login(response.data.accessToken);
      navigate("/user/home"); // Redireciona para a home do usuário
    } catch (error) {
  console.error("Falha na requisição:", error);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <CardContent>
          <Typography variant="h5" align="center">
            Registro
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="Usuário"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Senha"
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirmar Senha"
            variant="outlined"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={password !== confirmPassword && confirmPassword !== ""}
            helperText={
              password !== confirmPassword && confirmPassword !== ""
                ? "As senhas não coincidem"
                : ""
            }
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleRegister}
          >
            Registrar
          </Button>
          <Button
            fullWidth
            variant="text"
            color="secondary"
            onClick={() => navigate("/login")}
            style={{ marginTop: "10px" }}
          >
            POSSUI UMA CONTA? FAÇA O LOGIN AQUI
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Register;
