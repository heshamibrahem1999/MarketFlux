import './App.css';
import Appoverview from './Components/Appoverview/Appoverview';
import Header from './Components/Header/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import Portfoliogrowth from './Components/Portfoliogrowth/Portfoliogrowth';

function App() {
  return (
    <div className="App">
      <Header />
      <Appoverview />
      <Portfoliogrowth data={[1, 2, 3, 4, 5]} />
    </div>
  );
}

export default App;
