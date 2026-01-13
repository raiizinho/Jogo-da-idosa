function Login() {
    return (
        <>
        <div>
            <h1>Login Page</h1>
            <p>Please enter your credentials to log in.</p>
            <form>  
                <input type="text" placeholder="Username" />
                <input type="password" placeholder="Password" />
                <button type="submit">Login</button>
            </form>
        </div>
        </>
    )
} export default Login;