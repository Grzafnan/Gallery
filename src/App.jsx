import ImageGallery from "./components/ImageGallery";
import ImageProvider from "./context/ImageContext";
function App() {

  return (
    <ImageProvider>
      <main className="p-4">
        <ImageGallery />
      </main>
    </ImageProvider>
  );
}

export default App;
