import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/global.css";
import { Card, CardContent, Typography, TextField, Button } from "@mui/material";
import AuthContext from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      login(response.data.accessToken); // Usa a função de login do contexto
      alert("Login bem-sucedido!");
      navigate("/user/home"); // Redireciona após o estado ser atualizado
    } catch (error) {
  console.error("Falha na requisição:", error);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <CardContent>
          <Typography variant="h5" align="center">Login</Typography>
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
          <Button fullWidth variant="contained" color="primary" onClick={handleLogin}>
            Entrar
          </Button>
          <Button
            fullWidth
            variant="text"
            color="secondary"
            onClick={() => navigate("/register")}
            style={{ marginTop: "10px" }}
          >
            NÃO TEM UMA CONTA? REGISTRE-SE
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
