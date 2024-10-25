import { useCallback, useEffect, useRef, useState } from "react";

import "./App.css";

function App() {
  return (
    <div>
      <Target />
      <div style={{ height: 20 }} />
      <ImageCanvas width={390} height={693} numFrames={8} />
    </div>
  );
}

const Target = () => {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [direction, setDirection] = useState({ x: 1, y: 1 });
  const outerCircleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveInnerCircle = () => {
      const incrementSize = 1.3; // Change this value to increase or decrease speed
      const outerCircle = outerCircleRef.current;

      if (outerCircle) {
        const outerRadius = outerCircle.offsetWidth / 2;
        const innerRadius = 70; // Radius of the inner circle

        const newX = position.x + direction.x * incrementSize;
        const newY = position.y + direction.y * incrementSize;

        // Calculate the distance of the inner circle's center from the outer circle's center
        const outerCenter = { x: outerRadius, y: outerRadius };
        const distanceFromCenter = Math.sqrt(
          (newX - outerCenter.x) ** 2 + (newY - outerCenter.y) ** 2,
        );

        // Check if the inner circle hits the edge of the outer circle
        if (distanceFromCenter >= outerRadius - innerRadius) {
          setDirection((prevDir) => {
            const rand = Math.random();
            // generate between 0.2 and 1
            const yDir = Math.random() * 0.7 + 0.3;

            return {
              x: -prevDir.x,
              y: rand >= 0.5 ? -yDir : yDir,
            };
          });
        } else {
          // Update position
          setPosition({ x: newX, y: newY });
        }
      }
    };

    const interval = setInterval(moveInnerCircle, 20);
    return () => clearInterval(interval);
  }, [position, direction]);

  return (
    <div
      ref={outerCircleRef}
      style={{
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        backgroundColor: "lightgrey",
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          backgroundColor: "blue",
          position: "absolute",
          top: `${position.y}px`,
          left: `${position.x}px`,
          transform: "translate(-50%, -50%)",
        }}
      ></div>
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "green",
          position: "absolute",
          top: "100px",
          left: "100px",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
};

type ImageCanvasProps = {
  numFrames: number;
  width: number;
  height: number;
};

const ImageCanvas = ({ numFrames, width, height }: ImageCanvasProps) => {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const preloadImages = useCallback(() => {
    for (let i = 5; i < numFrames + 5; i++) {
      const img = new Image();
      const filename = i.toString().padStart(4, "0");
      const imgSrc = `/images/${filename}.png`;
      img.src = imgSrc;
      setImages((prevImages) => [...prevImages, img]);
    }
  }, [numFrames]);

  const renderCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    context.canvas.width = width;
    context.canvas.height = height;
  }, [height, width]);

  useEffect(() => {
    setImages([]);

    preloadImages();
    renderCanvas();
  }, [renderCanvas, preloadImages, numFrames]);

  const animationRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  function cancelPrevAnimation() {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }

  function clearPrevInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const handleShoot = () => {
    cancelPrevAnimation();
    clearPrevInterval();

    if (!canvasRef.current || images.length < 1) {
      return;
    }

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    let frameIndex = 0;

    intervalRef.current = setInterval(() => {
      const newFrameIndex = frameIndex + 1;
      if (newFrameIndex < numFrames) {
        frameIndex = newFrameIndex;
      } else {
        cancelPrevAnimation();
        clearPrevInterval();
      }
    }, 100);

    const render = () => {
      const imageToRender = images[frameIndex];
      context.clearRect(0, 0, 600, 1000);
      context.drawImage(imageToRender, 0, 0);
      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  return (
    <div style={{ height: 800, backgroundColor: "white" }}>
      <div>
        <canvas ref={canvasRef} />
      </div>
      <button onClick={handleShoot}>shoot</button>
    </div>
  );
};

export default App;
