import "./assets/reset.css";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import LoginPage from "./components/Login/LoginPage";
import UserContext from "./contexts/UserContext";
import { useState } from "react";
import SignupPage from "./components/Signup/SignupPage";
import Topbar from "./components/shared/Topbar/Topbar"
import TimelinePage from "./components/Timeline/TimelinePage";

export default function App() {
    const [userData, setUserData] = useState(null)

    return (
        <UserContext.Provider value={{ userData, setUserData }}>
            <BrowserRouter>
                {userData ? <Topbar /> : ""}
                <Switch>
                    <Route path="/" exact>
                        <LoginPage />
                    </Route>
                    <Route path="/sign-up" exact>
                        <SignupPage />
                    </Route>
                    <Route path="/timeline" exact>
                        <TimelinePage />
                    </Route>
                    <Route path="/my-posts" exact>

                    </Route>
                    <Route path="/my-likes" exact>

                    </Route>
                </Switch>
            </BrowserRouter>
        </UserContext.Provider>
    )
}