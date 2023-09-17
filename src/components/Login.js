import CircularProgress from "@mui/material/CircularProgress";
import { useUserAuth } from "../context/User_auth";
import {Link, useNavigate} from 'react-router-dom';
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import React, { useState } from "react";
import { Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";






const FormContainer = styled("form")({
  display: "flex",
  flexDirection: "column",
  maxWidth: "400px",
  flex: '1',
  gap: '10px',
  padding: '2%',
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.4)',
  borderRadius: '10px',
  fontFamily: 'Montserrat, sans-serif'
});



const LoginForm = () => {
  const {logIn} = useUserAuth();
  const [error, setError] = useState();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);


  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),


    onSubmit: async(values) => {
      setError("");
      setIsLoading(true);
      try{
        await logIn(values);
        setIsLoading(false);
        navigate("/home");
      }
      catch(err)
      {
        setError(err.message);
        setIsLoading(false);
      }
    },
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10% 1%'}}>
      <FormContainer onSubmit={formik.handleSubmit}>
        <h2 style={{
          margin: "0px",
          padding: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 'bolder', fontSize: '2em',
          fontFamily: 'Roboto Slab, serif',
          }}>Login</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>



          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            InputLabelProps={{style: { fontFamily: 'Montserrat, sans-serif', },}}
            inputProps={{style: { fontFamily: 'Montserrat, sans-serif', },}}/>



          <TextField
            fullWidth
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            InputLabelProps={{style: { fontFamily: 'Montserrat, sans-serif', },}}
            inputProps={{style: { fontFamily: 'Montserrat, sans-serif', },}}/>
        </div>



        <Button
          type="submit" variant="contained" color="primary" sx={{ mt: 2 }} style={{backgroundColor: 'orange'}} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "LogIn"}
        </Button>

        <div>
        Do you have an account? <Link to="/">Sign up</Link>
        </div>
      </FormContainer>
    </div>
  );
};
export default LoginForm;