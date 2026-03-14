import React from "react";
import './Card.css';
import { Col, Container, Row } from "react-bootstrap";

function Card({img, name, change}) {
  return (
    <div className="cards">
        <Container fluid className="p-0">
            <Row>
                <Col xs={10} className="text-left p-0">        
                    <img src={img} alt={name} width={'80%'} height={'40px'} />
                </Col>
                <Col xs={2} className="text-right ps-0 pe-0 py-auto">
                    <span>↗</span>
                </Col>
            </Row>
        </Container>
        <h6>{name}</h6>
        <p>{change}</p>
    </div>
  );
}

export default Card;