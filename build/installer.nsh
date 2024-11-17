!macro customInstall
  ClearErrors
  ReadRegDWORD $0 HKLM "SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\X64" "Installed"

  ${if} ${errors} 
  ${orIf} $0 == 0
    File /oname=$PLUGINSDIR\VC_redist.x64.exe "${BUILD_RESOURCES_DIR}\VC_redist.x64.exe"
    ExecWait '$PLUGINSDIR\VC_redist.x64.exe /q'
  ${endIf}
!macroend