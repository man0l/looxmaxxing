import ExpoModulesCore
import AVFoundation

// Reads the live exposure the running camera session has settled on (expo-camera
// owns the session; AVCaptureDevice exposes the shared hardware's current values)
// and converts it to an EV normalized to ISO 100. Higher EV = brighter scene.
public class CameraBrightnessModule: Module {
  public func definition() -> ModuleDefinition {
    Name("CameraBrightness")

    AsyncFunction("getBrightnessEV") { () -> Double? in
      return CameraBrightnessModule.currentEV()
    }
  }

  private static func frontCamera() -> AVCaptureDevice? {
    let discovery = AVCaptureDevice.DiscoverySession(
      deviceTypes: [.builtInWideAngleCamera, .builtInTrueDepthCamera],
      mediaType: .video,
      position: .front
    )
    return discovery.devices.first
  }

  private static func currentEV() -> Double? {
    guard let device = frontCamera() else { return nil }
    let iso = Double(device.iso)
    let duration = CMTimeGetSeconds(device.exposureDuration)
    let aperture = Double(device.lensAperture)
    guard iso > 0, duration > 0, aperture > 0, duration.isFinite else { return nil }
    // EV = log2(N^2 / t); normalize to ISO 100 so the value tracks scene brightness.
    let ev = log2((aperture * aperture) / duration) - log2(iso / 100.0)
    return ev.isFinite ? ev : nil
  }
}
