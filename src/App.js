import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Components/Header/Header";
import Appoverview from "./Components/Appoverview/Appoverview";
import Portfoliogrowth from "./Components/Portfoliogrowth/Portfoliogrowth";
import { Container } from "react-bootstrap";
import ShowTopPercent from "./Components/ShowTopPercent/ShowTopPercent";
import Discover from "./Components/Discover/Discover";
import Trends from "./Components/Trends/Trends";

function App() {
  return (
    <div className="App bg-black min-vh-100 text-light">
      <Header />

      <main>
        <Container fluid="lg" className="py-4">
          <Appoverview />
          <Portfoliogrowth />
        </Container>
        <ShowTopPercent />
        <Container fluid="lg" className="py-4">
          <Discover/>
          <Trends/>
        </Container>
      </main>
    </div>
  );
}

export default App;