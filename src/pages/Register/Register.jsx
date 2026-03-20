import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button/Button";
import Input from "../../components/ui/Input/Input";
import "./Register.scss";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      console.log("Full error:", err);
      console.log("Response data:", err.response?.data);
      console.log("Response status:", err.response?.status);
      setErrors(err.response?.data?.errors || ["Something went wrong"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">M</div>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__subtitle">Start building with Myriad Evo</p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          {errors.length > 0 && (
            <div className="auth-card__error">
              {errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}

          <div className="auth-card__row">
            <Input
              label="First name"
              name="first_name"
              placeholder="John"
              value={form.first_name}
              onChange={handleChange}
            />
            <Input
              label="Last name"
              name="last_name"
              placeholder="Doe"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>

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
          />

          <Input
            label="Confirm password"
            type="password"
            name="password_confirmation"
            placeholder="••••••••"
            value={form.password_confirmation}
            onChange={handleChange}
          />

          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-card__link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
