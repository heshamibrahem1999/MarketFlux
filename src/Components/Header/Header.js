import './Header.css';
import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function Header() {
  return (
    <Navbar expand="lg" className="custom-navbar navbar-dark pt-lg-3">
      <Container>
        <Navbar.Brand href="#home">MARKETFLUX</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" className='toggle'/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-lg-auto me-lg-0">
            <Nav.Link href="#">Invest</Nav.Link>
            <Nav.Link href="#">Learn</Nav.Link>
            <Nav.Link href="#">Grow</Nav.Link>
            <Nav.Link href="#">Insights</Nav.Link>
            <Nav.Link href="#">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;