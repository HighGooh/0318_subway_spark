import { BrowserRouter,Routes, Route } from "react-router-dom";
import '@styles/App.css'
import NotFound from '@pages/NotFound.jsx'
import Home from '@pages/Home.jsx'
import Jh_data from '@pages/Jh_data.jsx'
import Nav from '@pages/Nav.jsx'
import '@styles/Sidebar.css';

function App() {
   const paths = [
    {path: "/", element: <Home />},
    {path: "jh", element: <Jh_data />},
    {path: "*", element: <NotFound />},
  ]
  return (
    <>
      <BrowserRouter>
        <Nav />
        <Routes>
          { paths?.map((v, i) => <Route key={i} path={v.path} element={v.element} />) }
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
