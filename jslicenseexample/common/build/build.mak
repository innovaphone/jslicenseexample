
ifdef RELEASESTATE
rflags = -DBUILD='$(BUILD)' -DRELEASE_STATE='"$(RELEASESTATE) "'
else
rflags = -DBUILD='$(BUILD)'
endif

