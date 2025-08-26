import 'package:flutter/material.dart';
import 'package:reown_appkit/reown_appkit.dart';
import '../services/document_registry_service.dart';
import 'package:provider/provider.dart';
import '../state/auth_state.dart';
import 'qr_code_page.dart'; // Per visualizzare il QR code dopo la registrazione
class RegisterDocumentScreen extends StatefulWidget {
  const RegisterDocumentScreen({super.key});

  @override
  State<RegisterDocumentScreen> createState() => _RegisterDocumentScreenState();
}

class _RegisterDocumentScreenState extends State<RegisterDocumentScreen> {
  late final ReownAppKitModal _appKitModal;
  late final DocumentRegistryService _svc;

  final _hashCtl = TextEditingController();
  final _cidCtl = TextEditingController();
  final _metaCtl = TextEditingController(text: '{"name":"verbale.pdf","mime":"application/pdf"}');

  bool _busy = false;
  String? _txHash;

  @override
  void initState() {
    super.initState();

    // 1) Istanzia AppKit Modal (UI/connessione wallet)
    _appKitModal = ReownAppKitModal(
      context: context,
      projectId: 'bd05ce3bcca3f62a5f3aab11b3346224',
      metadata: const PairingMetadata(
        name: 'DApp Frontend',
        description: 'Document Registry dApp',
        url: 'https://example.com',
        icons: ['https://example.com/icon.png'],
        redirect: Redirect(
          native: 'mydapp://',
          universal: 'https://example.com/app',
        ),
      ),
    );

    // 2) Istanzia il service del contratto
    _svc = DocumentRegistryService(
      contractAddress: '0x742c0D167Db6E45EA5Ef6543Ab85774921644709',
      abiJson: '''
      [
        {
          "inputs": [
            {"internalType":"bytes32","name":"hash","type":"bytes32"},
            {"internalType":"string","name":"cid","type":"string"},
            {"internalType":"string","name":"metadata","type":"string"}
          ],
          "name":"registerDocument",
          "outputs":[],
          "stateMutability":"nonpayable",
          "type":"function"
        }
      ]
      ''',
    );

    // 3) Inizializza AppKit
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _appKitModal.init();
      setState(() {});
    });
  }

  /// ✅ Recupera i dati dal provider AuthState
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final auth = context.read<AuthState>();

    if (auth.lastHash != null) {
      _hashCtl.text = auth.lastHash!;
      _cidCtl.text = auth.lastCid ?? '';
      _metaCtl.text = auth.lastMetadata ?? '';
    }
  }

  @override
  void dispose() {
    _hashCtl.dispose();
    _cidCtl.dispose();
    _metaCtl.dispose();
    _appKitModal.dispose();
    super.dispose();
  }

  Future<void> _doRegister() async {
    final auth = context.read<AuthState>();

    if (auth.role != 'CERTIFICATORE_ROLE') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Solo i certificatori possono registrare documenti.')),
      );
      return;
    }

    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Effettua il login')),
      );
      return;
    }

    // Address match JWT ↔ MetaMask
    
    final chain = _appKitModal.selectedChain!;
    final nsInfo = NamespaceUtils.getNamespaceFromChain(chain.chainId);
    final mmAddr = _appKitModal.session!.getAddress(nsInfo)?.toLowerCase();
    final jwtAddr = auth.ethAddress?.toLowerCase();
    
    if (mmAddr == null || mmAddr != jwtAddr) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Address mismatch: JWT=$jwtAddr vs Wallet=$mmAddr')),
      );
      return;
    }

    if (!_appKitModal.isConnected) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connetti prima il wallet')),
      );
      return;
    }
    if (_appKitModal.selectedChain?.chainId != DocumentRegistryService.sepoliaChainId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Seleziona la rete Sepolia nel modal')),
      );
      return;
    }

    setState(() {
      _busy = true;
      _txHash = null;
    });

    try {
      // garantiamo che l’hash abbia il prefisso 0x
      var hashHex = _hashCtl.text.trim();
      if (!hashHex.startsWith('0x')) {
        hashHex = '0x$hashHex';
      }

      final tx = await _svc.registerDocumentWithAppKit(
        _appKitModal,
        hashHex: hashHex,
        cid: _cidCtl.text.trim(),
        metadata: _metaCtl.text.trim(),
      );
      setState(() => _txHash = tx);

      await _appKitModal.loadAccountData();
      if (!mounted) return;  // per sicurezza
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Documento registrato!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Errore: $e')),
      );
    } finally {
      setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final connected = _appKitModal.isConnected;
    final chain = _appKitModal.selectedChain?.chainId;

    return Scaffold(
      appBar: AppBar(title: const Text('Registra documento su Sepolia')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            Row(
              children: [
                AppKitModalNetworkSelectButton(appKit: _appKitModal, context: context),
                const SizedBox(width: 12),
                AppKitModalConnectButton(appKit: _appKitModal, context: context),
                const SizedBox(width: 12),
                if (_appKitModal.isConnected)
                  AppKitModalAccountButton(appKitModal: _appKitModal, context: context),
              ],
            ),
            const SizedBox(height: 12),
            Text('Stato: ${connected ? "Connesso" : "Disconnesso"} — Chain: ${chain ?? "-"}'),
            const Divider(height: 24),
            TextField(
              controller: _hashCtl,
              decoration: const InputDecoration(
                labelText: 'hashHex (bytes32, es. 0x + 64 hex)',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _cidCtl,
              decoration: const InputDecoration(
                labelText: 'CID IPFS (es. bafy...)',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _metaCtl,
              decoration: const InputDecoration(
                labelText: 'metadata (JSON)',
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _busy ? null : _doRegister,
              child: _busy ? const CircularProgressIndicator() : const Text('Invia transazione'),
            ),
            if (_txHash != null) ...[
              const SizedBox(height: 16),
              SelectableText('txHash: $_txHash'),
            ],
            ElevatedButton(
              onPressed: () {
                final cid = _cidCtl.text.trim();
                final txHash = _txHash ?? '';

                if (cid.isEmpty || txHash.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("CID o TxHash mancanti")),
                );
                    return;
              }
                  Navigator.push(
                      context,
                      MaterialPageRoute(
                      builder: (_) => QrCodePage(
                      impiantoId: context.read<AuthState>().selectedImpiantoId ?? "",
                      cid: cid,       // il CID ricevuto dall’upload
                      txHash: txHash, // l’hash della transazione
                        ),
                      ),
                    );
                },
              child: const Text("Genera QR Code"),
            ),
          ],
        ),
      ),
    );
  }
}
