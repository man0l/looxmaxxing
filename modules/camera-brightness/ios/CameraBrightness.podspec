Pod::Spec.new do |s|
  s.name           = 'CameraBrightness'
  s.version        = '1.0.0'
  s.summary        = 'Estimates ambient brightness from the front camera exposure (EV).'
  s.description    = 'Reads AVCaptureDevice ISO / exposure duration / aperture to derive an EV brightness estimate without opening a second capture session.'
  s.author         = ''
  s.homepage       = 'https://looxmaxxing.app'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
