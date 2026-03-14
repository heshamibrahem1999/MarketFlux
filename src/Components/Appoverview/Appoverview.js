import Button from 'react-bootstrap/Button';
import './Appoverview.css';
import React from 'react';
import Card from '../Card/Card';
import { Row,Col, Container } from 'react-bootstrap';
import application from '../../images/application.png';

function Appoverview() {
  return (
    <div className="app-overview">
      <Container>
        <Row>
          <Col className="text-left" xs={8}>
            <h1><span className='tech'>TECH</span> <span className='other'>THAT SHAPES TOMMOROW</span></h1>
          <Button className="download">Download the App</Button>
          <Row className='card-row'>
            <Col className='p-0 m-0'>
              <Card img="https://api.massive.com/v1/reference/company-branding/YWdpbGVudC5jb20/images/2025-04-04_logo.svg?apiKey=F3pp_p5yvgN6qapNanz4BmnqhMGKxHQT" name="Agilent" change="+10%" />
            </Col>
            <Col className='p-0 m-0'>
              <Card img="https://api.massive.com/v1/reference/company-branding/YWxjb2EuY29t/images/2025-04-04_logo.svg?apiKey=F3pp_p5yvgN6qapNanz4BmnqhMGKxHQT" name="Alcoa Corporation" change="+20%" />
            </Col>
            <Col className='p-0 m-0'>
              <Card img="https://api.massive.com/v1/reference/company-branding/YWxjb2EuY29t/images/2025-04-04_logo.svg?apiKey=F3pp_p5yvgN6qapNanz4BmnqhMGKxHQT" name="Alcoa Corporation" change="+20%" />
            </Col>
          </Row>
          </Col>
          <Col className="text-right" xs={4}>
            <img src={application} alt="application" />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Appoverview;