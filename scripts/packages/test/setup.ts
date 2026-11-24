import { installNetworkGuard } from './utils/network-guard.ts';

// Every test file of this workspace runs behind the network guard (AC-PACKAGES-12).
installNetworkGuard();
