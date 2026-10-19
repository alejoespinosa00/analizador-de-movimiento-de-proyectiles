import Card from '../components/ui/Card';
import VideoUploader from '../components/video/VideoUploader';
import VideoPlayer from '../components/video/VideoPlayer';
import FpsInput from '../components/video/FpsInput';
import ReferenceSystemPanel from '../components/analysis/ReferenceSystemPanel';
import MeasurementTable from '../components/analysis/MeasurementTable';
import ValidationPanel from '../components/analysis/ValidationPanel';
import ResultsPanel from '../components/analysis/ResultsPanel';
import TrajectoryChart from '../components/charts/TrajectoryChart';
import TimeSeriesChart from '../components/charts/TimeSeriesChart';
import { useAnalysisStore } from '../hooks/useAnalysisStore';
import { useRef } from 'react';
import FrameStepper from '../components/video/FrameStepper';
import VideoCanvasOverlay from '../components/video/VideoCanvasOverlay';

export default function AnalyzerPage() {
  const video = useAnalysisStore((s) => s.video);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!video) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-bold">Analizador</h1>
        <VideoUploader />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <div className="space-y-3">

            <VideoPlayer videoRef={videoRef}>
              <VideoCanvasOverlay />
            </VideoPlayer>


            <FrameStepper videoRef={videoRef} />
            <FpsInput />
          </div>
        </Card>
        <Card>
          <TrajectoryChart />
        </Card>
        <Card>
          <TimeSeriesChart />
        </Card>
      </div>
      <aside className="space-y-4">
        <Card>
          <ReferenceSystemPanel />
        </Card>
        <Card>
          <MeasurementTable />
        </Card>
        <Card>
          <ValidationPanel />
        </Card>
        <Card>
          <ResultsPanel />
        </Card>
      </aside>
    </div>
  );
}
