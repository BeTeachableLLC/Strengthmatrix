import React from 'react'
import logo from "../ui/logo-white.png";

function Header() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '40px',
            color: 'white',
            height: '60px',
            width: '100%',
            position: 'absolute',
            top: '0px',
            left: '0px',
            // zIndex: '1000',
            marginBottom: "20px",
        }} className='hea'>
            <img src={logo} alt='logo-img' width={188.78} height={48} />
             {/* <div className='flex flex-row' style={{
                fontSize: "1.5rem",
                fontFamily: "Lato",
                marginRight: "80px",
            }}>
               SWOTIFY 
            </div> */}
            <div></div>
        </div>
    )
}   

export default Header
