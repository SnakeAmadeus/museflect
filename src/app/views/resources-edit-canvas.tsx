import React, { useEffect, useRef, useState, MouseEvent as ReactMouseEvent, SetStateAction } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, KonvaNodeComponent } from 'react-konva';
import useImage from "use-image"
import { useGlobalUIStateStore } from '../services/store/ui-state.store';
import useResourceStore from '../services/store/resource.store';
import Konva from 'konva';

interface KonvaCanvasProps {
    maxWidth?: number;
    maxHeight?: number;
}

interface Point {
    x: number;
    y: number;
}

const ResourcesEditCanvas: React.FC<KonvaCanvasProps> = ({
    maxWidth = 800,
    maxHeight = 720,
}) => {
    // dataUrl holds the URL for the image to load. Then load image using useImage hook.
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [image] = useImage(dataUrl || '');
    // canvasSize is determined based on image dimensions and max constraints.
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
    const [baseCanvasSize, setBaseCanvasSize] = useState({ width: 600, height: 400 });
    const [canvasScale, setCanvasScale] = useState(1.00)
    const [baseCanvasScale, setBaseCanvasScale] = useState(1.00);
    const [canvasZoomLevel, setCanvasZoomLevel] = useState<number>(1.00);
    const MAX_CANVAS_ZOOM_LEVEL = 10;
    const MIN_CANVAS_ZOOM_LEVEL = 0.5;

    // A ref to the container DOM element so we can calculate bounds.
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    // A ref for the Konva Stage instance.
    const stageRef = useRef<Konva.Stage | null>(null);

    // Listen to changes in the global UI state to update the dataUrl.
    useEffect(() => {
        let previousId = useGlobalUIStateStore.getState().globalUIState.curEditingResourceId;
        const unsubscribe = useGlobalUIStateStore.subscribe((state) => {
            const currentId = state.globalUIState.curEditingResourceId;
            if (currentId !== previousId) {
                previousId = currentId;
                if (currentId) {
                    const resourceData = useResourceStore.getState().resourceDataTree.getNode(currentId);
                    if (resourceData?.dataUrl) {
                        setDataUrl(resourceData.dataUrl);
                    }
                }
            }
        });
        return () => unsubscribe();
    }, []);
    // When dataUrl changes, load the image to determine natural size.
    useEffect(() => {
        if (dataUrl) {
            const img = new Image();
            img.onload = () => {
                let newWidth = img.width;
                let newHeight = img.height;
                let newScale = 1;
                if (img.width > maxWidth || img.height > maxHeight) {
                    const scaleFactor = Math.min(maxWidth / img.width, maxHeight / img.height);
                    console.log()
                    newWidth = Math.floor(img.width * scaleFactor);
                    newHeight = Math.floor(img.height * scaleFactor);
                    newScale = scaleFactor;
                }

                setCanvasSize({ width: newWidth, height: newHeight });
                setBaseCanvasSize({ width: newWidth, height: newHeight });
                setCanvasScale(newScale);
                setBaseCanvasScale(newScale);
                if (stageRef.current) {
                    stageRef.current.scaleX(newScale);
                    stageRef.current.scaleY(newScale);
                }
                console.log("Initial Canvas Scale: ", newScale);
            };
            img.src = dataUrl;
        }
    }, [dataUrl, maxWidth, maxHeight]);
    // Also, do an initial data load.
    useEffect(() => {
        const currentEditingId = useGlobalUIStateStore.getState().globalUIState.curEditingResourceId;
        if (currentEditingId) {
            const resourceData = useResourceStore.getState().resourceDataTree.getNode(currentEditingId);
            if (resourceData?.dataUrl) {
                setDataUrl(resourceData.dataUrl);
            }
        }
    }, []);

    // For Photoshop-style selection, we track whether a selection is active
    // and the starting and current point.
    const [isSelecting, setIsSelecting] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [selectingStart, setSelectingStart] = useState<Point | null>(null);
    const [selectingEnd, setSelectingEnd] = useState<Point | null>(null);
    const [selectedStart, setSelectedStart] = useState<Point | null>(null);
    const [selectedEnd, setSelectedEnd] = useState<Point | null>(null);
    const selectionBoxRef = useRef<Konva.Rect | null>(null);
    // Helper: Given a mouse event, return a point in stage coordinates.
    // If the event is outside the stage (canvas), clamp it to the border.
    const getClampedPoint = (x: number, y: number): Point => {
        if (!containerRef.current) return { x: 0, y: 0 };
        if (!canvasRef.current) return { x: 0, y: 0};
        const containerRect = containerRef.current.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        x = x - containerRect.left;
        y = y - containerRect.top;

        const canvasRectLeftBorder = canvasRect.left - containerRect.left;
        const canvasRectTopBorder = canvasRect.top - containerRect.top;
        let clampedX = x - canvasRectLeftBorder;
        let clampedY = y - canvasRectTopBorder;

        if (clampedX < 0) clampedX = 0;
        if (clampedX > canvasSize.width) clampedX = canvasSize.width;
        if (clampedY < 0) clampedY = 0;
        if (clampedY > canvasSize.height) clampedY = canvasSize.height;

        return { x: clampedX, y: clampedY };
    };
    // Mouse event handlers for the container.
    const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
        const clickCoordX = e.clientX;
        const clickCoordY = e.clientY;

        const point = getClampedPoint(clickCoordX, clickCoordY);
        setIsSelected(false);
        setIsSelecting(true);
        setSelectingStart(point);
        setSelectingEnd(point);
    };
    const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (!isSelecting) return;
        const point = getClampedPoint(e.clientX, e.clientY);
        setSelectingEnd(point);
    };
    const handleMouseUp = (e: ReactMouseEvent<HTMLDivElement>) => {
        if (isSelecting) {
            setIsSelecting(false);
            
            // Finialize the selection.
            if(selectingStart?.x != selectingEnd?.x && selectingStart?.y != selectingEnd?.y) {
                setIsSelected(true);
                setSelectedStart(selectingStart);
                setSelectedEnd(selectingEnd);
            }
            else {
                setTimeout(() => {
                    setSelectingStart(null);
                    setSelectingEnd(null);
                }, 100);
            }
        }
    };
    // Calculate the selection rectangle properties.
    const selectingRectProps = (() => {
        if (!isSelecting) return null;
        if (!selectingStart || !selectingEnd) return null;
        const x = Math.min(selectingStart.x, selectingEnd.x) / canvasScale;
        const y = Math.min(selectingStart.y, selectingEnd.y) / canvasScale;
        const width = Math.abs(selectingEnd.x - selectingStart.x) / canvasScale;
        const height = Math.abs(selectingEnd.y - selectingStart.y) / canvasScale;
        return { x, y, width, height };
    })();
    const selectedRectProps = (() => {
        if (!isSelected) return null;
        if (!selectedEnd || !selectedStart) return null;
        const x = Math.min(selectedStart.x, selectedEnd.x) / canvasScale;
        const y = Math.min(selectedStart.y, selectedEnd.y) / canvasScale;
        const width = Math.abs(selectedEnd.x - selectedStart.x) / canvasScale;
        const height = Math.abs(selectedEnd.y - selectedStart.y) / canvasScale;
        return { x, y, width, height };
    })();
    // const [selectionRectAnimationintervalId, setSelectionRectAnimationintervalId] = useState<NodeJS.Timeout>();
    // var selectionRectAnimationPattern = true;
    // const selectedRectAnimationTween = ((pattern: boolean) => {
    //     if (!selectionBoxRef.current) return null;
    //     return pattern ?
    //         new Konva.Tween({
    //             node: selectionBoxRef.current,
    //             duration: 1,
    //             dash: [8, 8],
    //             easing: Konva.Easings.Linear
    //         }) :
    //         new Konva.Tween({
    //             node: selectionBoxRef.current,
    //             duration: 1,
    //             dash: [4, 4],
    //             easing: Konva.Easings.Linear
    //         });
    // })
    // useEffect(() => {
    //     console.log("isSelected = ", isSelected);
    //     if (isSelected) {
    //         setSelectionRectAnimationintervalId(setInterval(() => {
    //             console.log("Playing Animation", selectionRectAnimationintervalId);
    //             let animation = selectedRectAnimationTween(selectionRectAnimationPattern);
    //             if (animation) {
    //                 animation.play()
    //                 selectionRectAnimationPattern = !selectionRectAnimationPattern;
    //             }
    //         }, 1000))
    //     }
    //     else {
    //         console.log("Stop playing animation", selectionRectAnimationintervalId);
    //         clearInterval(selectionRectAnimationintervalId);
    //     }
    // }, [isSelected])

    // Zoom-in-out Functionality by Scrolling Mouse Wheel
    const handleWheelScroll = (e: ReactMouseEvent<HTMLDivElement>) => {
        const scrollDeltaY = (e.nativeEvent as WheelEvent).deltaY;
        setCanvasZoomLevel((prevState) => {
            const newState = prevState + (-scrollDeltaY / 1000);
            if (newState >= MAX_CANVAS_ZOOM_LEVEL) {
                return MAX_CANVAS_ZOOM_LEVEL;
            }
            if (newState <= MIN_CANVAS_ZOOM_LEVEL) {
                return MIN_CANVAS_ZOOM_LEVEL;
            }
            return newState;
        });
    }
    const changeZoomLevel = (zoomLevel: number) => {
        if (stageRef.current) {
            setCanvasSize({
                width: baseCanvasSize.width * zoomLevel,
                height: baseCanvasSize.height * zoomLevel
            })
            const newScale = baseCanvasScale * zoomLevel
            setCanvasScale(newScale);
            stageRef.current.scaleX(newScale);
            stageRef.current.scaleY(newScale);
            const convertSelectionScale = (prevState: Point | null) => {
                if (prevState) {
                    return {
                        x: prevState.x * (newScale / canvasScale),
                        y: prevState.y * (newScale / canvasScale)
                    };
                } else return null;
            };
            setSelectingStart((prevState) => convertSelectionScale(prevState));
            setSelectingEnd((prevState) => convertSelectionScale(prevState));
            setSelectedStart((prevState) => convertSelectionScale(prevState));
            setSelectedEnd((prevState) => convertSelectionScale(prevState));
            stageRef.current.draw(); // Redraw the stage after scaling
        }
    }
    useEffect(() => {
        changeZoomLevel(canvasZoomLevel);
    }, [canvasZoomLevel])

    return (
        <div
            ref={containerRef}
            className="resource-canvas-container flex grow justify-center items-center bg-neutral-200 h-full w-full"
            style={{ maxHeight: '100%', maxWidth: '100%'}}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheelScroll}
        >
            <div
                className=" bg-white drop-shadow-lg" 
                style={{ height: `${canvasSize.height}`, width: `${canvasSize.width}` }} 
                ref={canvasRef}
            >
                <Stage width={canvasSize.width} height={canvasSize.height} ref={stageRef}>
                    <Layer>
                        {image && (
                            <KonvaImage
                                image={image}
                                x={0}
                                y={0}
                            />
                        )}
                        {selectingRectProps && (
                            <Rect
                                {...selectingRectProps}
                                stroke="blue"
                                strokeWidth={2}
                                dash={[8, 8]}
                                listening={false}
                            />
                        )}
                        {selectedRectProps && (
                            <Rect
                                ref={selectionBoxRef}
                                {...selectedRectProps}
                                stroke="blue"
                                strokeWidth={2}
                                dash={[6, 6]}
                                listening={false}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
            
        </div>
    );
};

export default ResourcesEditCanvas;
