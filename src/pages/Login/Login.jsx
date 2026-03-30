import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./Login.scss";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(form);
      console.log("Logged in user:", loggedInUser);
      // if (loggedInUser) {
      //   navigate("/dashboard", { replace: true });
      // }
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">M</div>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">
            Sign in to your Myriad Evo workspace
          </p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          {error && <div className="auth-card__error">{error}</div>}

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@myriadevo.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-card__link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
