CREATE TABLE `acesso` (
    `idAcesso` int NOT NULL AUTO_INCREMENT,
    `codAcesso` varchar(30) NOT NULL,
    `direcAcesso` int NOT NULL,
    `codUsuario` int NOT NULL,
    `codOrganization` int NOT NULL,
    `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `is_present` int NOT NULL DEFAULT '0',
    PRIMARY KEY (`idAcesso`)
) ENGINE = InnoDB AUTO_INCREMENT = 20786 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `associado` (
    `codAssociado` int NOT NULL AUTO_INCREMENT,
    `razaoAssociado` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    `cnpjAssociado` varchar(18) NOT NULL,
    `idLoja` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    `backup_razao` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    `id_grupo` int DEFAULT NULL,
    PRIMARY KEY (`codAssociado`)
) ENGINE = InnoDB AUTO_INCREMENT = 888889 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `categoria` (
    `codCategoria` int NOT NULL AUTO_INCREMENT,
    `descCategoria` varchar(50) NOT NULL,
    PRIMARY KEY (`codCategoria`)
) ENGINE = InnoDB AUTO_INCREMENT = 14 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `cliente` (
    `codCliente` int NOT NULL AUTO_INCREMENT,
    `nomeCliente` varchar(50) NOT NULL,
    `codAssocCliente` int NOT NULL,
    `cpfCliente` varchar(14) NOT NULL,
    `telCliente` varchar(14) NOT NULL,
    `emailCliente` varchar(50) NOT NULL,
    PRIMARY KEY (`codCliente`)
) ENGINE = InnoDB AUTO_INCREMENT = 13 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `comprador` (
    `codCompr` int NOT NULL,
    `nomeCompr` varchar(50) NOT NULL,
    `descCatComprador` varchar(50) NOT NULL,
    `color` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `consultor` (
    `codConsult` int NOT NULL AUTO_INCREMENT,
    `nomeConsult` varchar(50) NOT NULL,
    `cpfConsult` varchar(14) NOT NULL,
    `telConsult` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    `codFornConsult` int NOT NULL,
    `emailConsult` varchar(50) NOT NULL,
    PRIMARY KEY (`codConsult`)
) ENGINE = InnoDB AUTO_INCREMENT = 210654 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `fornecedor` (
    `codForn` int NOT NULL AUTO_INCREMENT,
    `nomeForn` varchar(50) NOT NULL,
    `razaoForn` varchar(50) NOT NULL,
    `cnpjForn` varchar(18) NOT NULL,
    `telForn` varchar(14) NOT NULL,
    `codCategoria` int NOT NULL,
    `codComprFornecedor` int NOT NULL,
    `image` varchar(200) DEFAULT NULL,
    `color` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
    PRIMARY KEY (`codForn`)
) ENGINE = InnoDB AUTO_INCREMENT = 39358 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `grupos_empresariais` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_erp` int NOT NULL,
    `descricao` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 57 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `log` (
    `id` int NOT NULL AUTO_INCREMENT,
    `userAgent` text NOT NULL,
    `method` enum('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL,
    `route` varchar(255) NOT NULL,
    `body` json DEFAULT NULL,
    `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 273673 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `mercadoria` (
    `codMercadoria` int NOT NULL AUTO_INCREMENT,
    `codFornMerc` int NOT NULL,
    `nomeMercadoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    `embMercadoria` varchar(10) NOT NULL,
    `fatorMerc` int NOT NULL,
    `precoMercadoria` float NOT NULL,
    `precoUnit` float DEFAULT NULL,
    `barcode` varchar(100) DEFAULT NULL,
    `complemento` varchar(255) DEFAULT NULL,
    `marca` varchar(100) DEFAULT NULL,
    `erpcode` varchar(100) DEFAULT NULL,
    `nego` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    `codMercadoria_ext` int DEFAULT NULL,
    `novo_codMercadoria` int DEFAULT NULL,
    `codMercadoria_final` int DEFAULT NULL,
    PRIMARY KEY (`codMercadoria`, `nego`)
) ENGINE = InnoDB AUTO_INCREMENT = 6166769 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `mercadoriaNova` (
    `codMercadoria` int DEFAULT NULL,
    `codFornMerc` int DEFAULT NULL,
    `nomeMercadoria` varchar(100) DEFAULT NULL,
    `embMercadoria` varchar(20) DEFAULT NULL,
    `fatorMerc` int DEFAULT NULL,
    `precoMercadoria` float DEFAULT NULL,
    `precoUnit` float DEFAULT NULL,
    `barcode` varchar(100) DEFAULT NULL,
    `complemento` varchar(100) DEFAULT NULL,
    `marca` varchar(100) DEFAULT NULL,
    `erpcode` varchar(100) DEFAULT NULL,
    `negociacao` int DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `negociacao` (
    `codNegociacao` int NOT NULL AUTO_INCREMENT,
    `descNegociacao` varchar(50) NOT NULL,
    `codFornNegociacao` int NOT NULL,
    `prazo` datetime(6) DEFAULT NULL,
    `observacao` varchar(255) DEFAULT NULL,
    `codNegoErp` varchar(20) DEFAULT NULL,
    `codFornNegoBackup` int DEFAULT NULL,
    PRIMARY KEY (`codNegociacao`)
) ENGINE = InnoDB AUTO_INCREMENT = 131635352 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `negociacao_loja` (
    `id` int NOT NULL AUTO_INCREMENT,
    `id_negociacao_loja` varchar(30) DEFAULT NULL,
    `id_negociacao` varchar(30) DEFAULT NULL,
    `id_loja` varchar(30) DEFAULT NULL,
    `status` int DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1269620 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `negotiation_windows` (
    `id` int NOT NULL AUTO_INCREMENT,
    `consultant_id` int NOT NULL,
    `supplier_id` int NOT NULL,
    `client_id` int NOT NULL,
    `store_id` int DEFAULT NULL,
    `start_at` datetime DEFAULT NULL,
    `end_at` datetime DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3919 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `notices` (
    `codNotice` int NOT NULL AUTO_INCREMENT,
    `title` varchar(100) NOT NULL,
    `description` varchar(1000) NOT NULL,
    `image` varchar(200) NOT NULL,
    `action` varchar(200) NOT NULL,
    `priority` int NOT NULL,
    `primaryColor` varchar(10) DEFAULT NULL,
    `secondaryColor` varchar(10) DEFAULT NULL,
    `stamp` varchar(10) DEFAULT NULL,
    `type` tinyint DEFAULT NULL,
    PRIMARY KEY (`codNotice`)
) ENGINE = InnoDB AUTO_INCREMENT = 5 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `notifications` (
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) DEFAULT NULL,
    `content` text,
    `redirect` int DEFAULT NULL,
    `target` int DEFAULT NULL,
    `method` int DEFAULT NULL,
    `day` int DEFAULT NULL,
    `month` int DEFAULT NULL,
    `hour` int DEFAULT NULL,
    `minute` int DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `sent` int DEFAULT NULL,
    `provider` int DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 296 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `organizador` (
    `codOrg` int NOT NULL,
    `nomeOrg` varchar(50) NOT NULL,
    `razaoOrg` varchar(100) NOT NULL,
    `cnpjOrg` varchar(20) NOT NULL,
    `emailOrg` varchar(50) NOT NULL,
    `telOrg` varchar(14) NOT NULL,
    `ativo` int DEFAULT NULL,
    `mapa` varchar(300) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `pedido` (
    `codPedido` int NOT NULL AUTO_INCREMENT,
    `codFornPedido` int NOT NULL,
    `codAssocPedido` int NOT NULL,
    `codComprPedido` int NOT NULL,
    `codMercPedido` int NOT NULL,
    `codNegoPedido` int NOT NULL,
    `quantMercPedido` int NOT NULL,
    `codOrganizador` int DEFAULT NULL,
    `dataPedido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `codConsultPedido` int DEFAULT NULL,
    PRIMARY KEY (`codPedido`),
    UNIQUE KEY `idx_codMercadoria_codNegociacao_codAssociado` (`codMercPedido`, `codNegoPedido`, `codAssocPedido`),
    UNIQUE KEY `unique_key_merc_nego_assoc` (`codMercPedido`, `codNegoPedido`, `codAssocPedido`),
    UNIQUE KEY `unique_key` (`codMercPedido`, `codNegoPedido`, `codAssocPedido`),
    KEY `codConsultPedido` (`codConsultPedido`)
) ENGINE = InnoDB AUTO_INCREMENT = 143493 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `relaciona` (
    `codRelaciona` int NOT NULL AUTO_INCREMENT,
    `codAssocRelaciona` int DEFAULT NULL,
    `codConsultRelaciona` int DEFAULT NULL,
    PRIMARY KEY (`codRelaciona`)
) ENGINE = InnoDB AUTO_INCREMENT = 40699 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `relacionaMercadoria` (
    `codRelacionaMercadoria` int NOT NULL AUTO_INCREMENT,
    `codNegociacao` int DEFAULT NULL,
    `codMercadoria` int DEFAULT NULL,
    PRIMARY KEY (`codRelacionaMercadoria`)
) ENGINE = InnoDB AUTO_INCREMENT = 696 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `relacionafornecedor` (
    `codRelaciona` int NOT NULL AUTO_INCREMENT,
    `codConsultor` int NOT NULL,
    `codFornecedor` int NOT NULL,
    PRIMARY KEY (`codRelaciona`)
) ENGINE = InnoDB AUTO_INCREMENT = 5261 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `schedule` (
    `code` int NOT NULL AUTO_INCREMENT,
    `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `content` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `hour` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `image` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    PRIMARY KEY (`code`)
) ENGINE = InnoDB AUTO_INCREMENT = 32 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE `user_notifications` (
    `id` int NOT NULL AUTO_INCREMENT,
    `user` int NOT NULL,
    `notification` int NOT NULL,
    `viewed` tinyint(1) DEFAULT '0',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `success` tinyint(1) DEFAULT NULL,
    `reason` mediumtext,
    PRIMARY KEY (`id`),
    KEY `user` (`user`),
    KEY `notification` (`notification`),
    CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user`) REFERENCES `consultor` (`codConsult`),
    CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`notification`) REFERENCES `notifications` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 4244 DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;