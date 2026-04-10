import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./Login.scss";
import api from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [params] = useSearchParams()
  const justRegistered = params.get("registered") === "true"

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form);
      if (user) navigate("/dashboard", { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError("")
    setDemoLoading(true)
    try {
      const res = await api.post("/api/v1/demo_login")
      const { token, user } = res.data

      await login({ token, user })
      navigate("/dashboard", { replace: true })
    } catch {
      setError("Demo account unavailable. Please try again.")
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">M</div>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__subtitle">
            Sign in to your Core Desk workspace
          </p>
        </div>

        {justRegistered && (
          <div className="auth-card__success">
            Account created. Sign in to get started.
          </div>
        )}

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

        <div className="auth-card__divider">
          <span>or</span>
        </div>

        <button
          className="auth-card__demo-btn"
          onClick={handleDemo}
          disabled={demoLoading}
        >
          {demoLoading ? "Loading demo..." : "Try the live demo"}
        </button>

        <p className="auth-card__demo-note">
          Explore all features with sample data. No sign up needed.
        </p>

        <p className="auth-card__footer">
          New company?{" "}
          <Link to="/register" className="auth-card__link">
            Create a workspace
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
