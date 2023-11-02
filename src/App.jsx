import { DndProvider } from "react-dnd";
import ImageGallery from "./components/ImageGallery";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <ImageGallery />
      </DndProvider>
    </>
  );
}

export default App;
