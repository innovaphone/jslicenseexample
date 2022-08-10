
PROJECT		= jslicenseexample

include sdk/platform/sdk-defs.mak

ifeq ($(NO_RTM), 1)
COPY_RTM = 0
else
COPY_RTM = 1
endif

FILES			=
SDK-WEB1		= web1
PROJ-DEST-DIR	= $(OUTDIR)/$(PROJECT)

RUNTIME-BIN		= jse/$(MAKECMDGOALS)/generic

include $(PROJECT)/$(PROJECT).mak

OBJ-DIR			= $(OUTDIR)/obj/
FILE-LIST		= $(foreach cur,$(FILES),$(cur),)
ZIP-FILE		= $(PROJ-DEST-DIR)/httpfiles.zip

ifeq ($(OUTDIR),.)
$(error The given target $(MAKECMDGOALS) is unkown or not supported)
endif

$(ZIP-FILE): force
	powershell -ExecutionPolicy Bypass -file build.ps1 -prjout "$(PROJ-DEST-DIR)" -temp "$(OBJ-DIR)" -project "$(PROJECT)" -rtm "$(RUNTIME-BIN)" -files "$(FILE-LIST)" -copyRTM $(COPY_RTM)

clean-arm clean-arm64 clean-x86_64:
	@echo Cleaning previous build $(OUTDIR)...
	@if exist $(OUTDIR) (rd /s /q $(OUTDIR) 2>NUL)

arm arm64 x86_64: $(ZIP-FILE)
