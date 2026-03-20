import { useNavigate } from "react-router-dom";


const Nav = () => {
    const navigate = useNavigate();

    return(
        <header className="p-3 border-bottom bg-white sticky-top">
            <h5 className="mb-0 fw-bold text-primary" onClick={()=>navigate('/')} style={{cursor: 'pointer'}}>Team4</h5>
        </header>
      )
}

export default Nav;