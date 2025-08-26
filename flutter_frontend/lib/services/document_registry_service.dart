// Service per interagire con lo smart contract DocumentRegistry
// usando Reown AppKit (WalletConnect v2) + web3dart.
// La UI (AppKit Modal) viene gestita nella screen; qui encodiamo la call.

import 'dart:typed_data';
import 'package:reown_appkit/reown_appkit.dart';
//import 'package:web3dart/web3dart.dart';

class DocumentRegistryService {
  final String contractAddress; // es. "0x742c0D167Db6E45EA5Ef6543Ab85774921644709"
  final String abiJson;         // ABI con registerDocument(bytes32,string,string)

  late final ContractAbi _abi;
  late final DeployedContract _contract;
  late final ContractFunction _fnRegister;

  static const String sepoliaChainId = 'eip155:11155111';

  DocumentRegistryService({
    required this.contractAddress,
    required this.abiJson,
  }) {
    _abi = ContractAbi.fromJson(abiJson, 'DocumentRegistry');
    _contract = DeployedContract(_abi, EthereumAddress.fromHex(contractAddress));
    _fnRegister = _contract.function('registerDocument');
  }

  DeployedContract get deployedContract => _contract;

  Uint8List hexToBytes32(String hex) {
    final clean = hex.startsWith('0x') ? hex.substring(2) : hex;
    if (clean.length != 64) {
      throw ArgumentError('hashHex deve essere esattamente 32 bytes (64 caratteri hex).');
    }
    final out = Uint8List(32);
    for (int i = 0; i < 32; i++) {
      out[i] = int.parse(clean.substring(i * 2, i * 2 + 2), radix: 16);
    }
    return out;
  }

  Uint8List encodeRegisterDocument({
    required String hashHex,
    required String cid,
    required String metadata,
  }) {
    return Uint8List.fromList(
      _fnRegister.encodeCall([hexToBytes32(hashHex), cid, metadata]),
    );
  }

  void _ensureReady(ReownAppKitModal modal) {
    if (modal.session == null) {
      throw StateError('Nessuna sessione attiva: connetti prima il wallet.');
    }
    final chain = modal.selectedChain?.chainId;
    if (chain != sepoliaChainId) {
      throw StateError('Chain selezionata "$chain". Seleziona Sepolia ($sepoliaChainId).');
    }
  }

  String _senderAddress(ReownAppKitModal modal) {
    final chainId = modal.selectedChain!.chainId;
    final ns = NamespaceUtils.getNamespaceFromChain(chainId);
    final addr = modal.session!.getAddress(ns);
    if (addr == null || addr.isEmpty) {
      throw StateError('Impossibile ottenere l`indirizzo mittente dal wallet.');
    }
    return addr;
  }

  /// Esegue registerDocument(bytes32,string,string) firmata nel wallet
  Future<String> registerDocumentWithAppKit(
    ReownAppKitModal modal, {
    required String hashHex,
    required String cid,
    required String metadata,
    BigInt? gas,
    BigInt? gasPriceWei,
    BigInt? valueWei,
    int? nonce,
  }) async {
    _ensureReady(modal);

    final chainId = modal.selectedChain!.chainId; // "eip155:11155111"
    final from = _senderAddress(modal);

    final tx = Transaction(
      from: EthereumAddress.fromHex(from),
      to: EthereumAddress.fromHex(contractAddress),
      maxGas: gas?.toInt(),
      gasPrice: gasPriceWei != null ? EtherAmount.inWei(gasPriceWei) : null,
      value: valueWei != null ? EtherAmount.inWei(valueWei) : null,
      nonce: nonce,
    );

    final params = <dynamic>[
      hexToBytes32(hashHex),
      cid,
      metadata,
    ];

    final result = await modal.requestWriteContract(
      topic: modal.session!.topic,
      chainId: chainId,
      deployedContract: _contract,
      functionName: 'registerDocument',
      transaction: tx,
      parameters: params,
    );

    return result is String ? result : (result?.toString() ?? '');
  }
}
