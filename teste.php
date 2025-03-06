<?php

header('Content-Type: text/html; charset=utf-8');

$response = array();
$response["erro"] = true;

$access = json_decode($HTTP_RAW_POST_DATA);


$condicao = false;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {

	$response["erro"] = false;

	include 'dbConnection.php';

	$conn = new mysqli($HostName, $HostUser, $HostPass, $DataBaseName);


	mysqli_set_charset($conn, "utf-8");

	if ($conn->connect_error) {
		die("Ops, falha na conexão!");
	}
	$codAcessoa = "" . $access->codAcesso . "";

	$testeCodAcesso = "SET sql_mode = ''; select codAcesso, direcAcesso 
from acesso where codAcesso = $codAcessoa";

	$primerResult = $conn->query($testeCodAcesso);
	$resultadoDirec = mysqli_fetch_array($primerResult);

	$segundoTeste = "
select codMercPedido
from pedido join fornecedor on pedido.codFornPedido = fornecedor.codForn
join relacionafornecedor on relacionafornecedor.codFornecedor = fornecedor.codForn
join consultor on consultor.codConsult = relacionafornecedor.codConsultor
join acesso on acesso.codUsuario = consultor.codConsult
where acesso.codAcesso = $codAcessoa
limit 1";



	$segundoResult = $conn->query($segundoTeste);
	$resultQuant = mysqli_fetch_array($segundoResult);


	if ($resultadoDirec['direcAcesso'] == 1) {


		$sql = "SET sql_mode = ''; select acesso.codAcesso, acesso.direcAcesso,fornecedor.nomeForn,fornecedor.cnpjForn, acesso.codUsuario, fornecedor.codForn, consultor.nomeConsult,consultor.cpfConsult,
	sum(mercadoria.precoMercadoria*pedido.quantMercPedido) as 'valorPedido'
	from acesso 
	join consultor on acesso.codUsuario = consultor.codConsult 
	join relacionafornecedor on consultor.codConsult = relacionafornecedor.codConsultor	
	join fornecedor on relacionafornecedor.codFornecedor = fornecedor.codForn
	join pedido on pedido.codFornPedido = fornecedor.codForn
	join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido
	where acesso.codAcesso = $codAcessoa";

		$result = $conn->query($sql);

		if ($segundoResult->num_rows > 0) {
			if ($result->num_rows > 0) {
				$registro = mysqli_fetch_array($result);
				$response["erro"] = false;
				$response["codAcesso"] = $registro['codAcesso'];
				$response["codForn"] = $registro['codForn'];
				$response["direcAcesso"] = $registro['direcAcesso'];
				$response["codUsuario"] = $registro['codUsuario'];
				$response["nomeUsuario"] = $registro['nomeConsult'];
				$response["cpfUsuario"] = $registro['cpfConsult'];
				$response["razaoForn"] = $registro['nomeForn'];
				$response["cnpjForn"] = $registro['cnpjForn'];
				$response["valorPedido"] = number_format($registro['valorPedido'], 2, ',', '.');
			}
		} else {


			$sql = "SET sql_mode = ''; select acesso.codAcesso, acesso.direcAcesso,fornecedor.nomeForn,fornecedor.cnpjForn, acesso.codUsuario, fornecedor.codForn, consultor.nomeConsult,consultor.cpfConsult
		from acesso 
		join consultor on acesso.codUsuario = consultor.codConsult 
		join fornecedor on consultor.codFornConsult = fornecedor.codForn
		where acesso.codAcesso = $codAcessoa";



			$result = $conn->query($sql);

			if ($result->num_rows > 0) {



				$registro = mysqli_fetch_array($result);
				$response["erro"] = false;
				$response["codAcesso"] = $registro['codAcesso'];
				$response["codForn"] = $registro['codForn'];
				$response["direcAcesso"] = $registro['direcAcesso'];
				$response["codUsuario"] = $registro['codUsuario'];
				$response["nomeUsuario"] = $registro['nomeConsult'];
				$response["cpfUsuario"] = $registro['cpfConsult'];
				$response["razaoForn"] = $registro['nomeForn'];
				$response["cnpjForn"] = $registro['cnpjForn'];
				$response["valorPedido"] = number_format(0, 2, ',', '.');
			} else {
				die("Ops, falha na Query!");
			}
		}
	} else if ($resultadoDirec['direcAcesso'] == 2) {

		$sqlTeste = "SET sql_mode = ''; select codMercPedido
		from pedido join associado on pedido.codAssocPedido = associado.codAssociado
		join relaciona on relaciona.codConsultRelaciona = associado.codAssociado
		join consultor on consultor.codConsult = relaciona.codAssocRelaciona
		join acesso on acesso.codUsuario = consultor.codConsult
		where acesso.codAcesso = $codAcessoa
		limit 1";

		$resultadoAssoc = $conn->query($sqlTeste);
		$resultAs = mysqli_fetch_array($resultadoAssoc);

		if ($resultadoAssoc->num_rows > 0) {


			$sql = "SET sql_mode = ''; select acesso.codAcesso, acesso.direcAcesso, associado.razaoAssociado AS nomeForn, associado.cnpjAssociado AS cnpjForn, acesso.codUsuario, associado.codAssociado AS codForn, consultor.nomeConsult, consultor.cpfConsult,
			sum(mercadoria.precoMercadoria*pedido.quantMercPedido) as 'valorPedido'
			FROM acesso
			join consultor on acesso.codUsuario = consultor.codConsult
			join relaciona on relaciona.codAssocRelaciona = consultor.codConsult
			join associado on associado.codAssociado = relaciona.codConsultRelaciona
			join pedido on pedido.codAssocPedido = associado.codAssociado
			join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido
			WHERE acesso.codAcesso =   $codAcessoa";

			$result = $conn->query($sql);


			if ($result->num_rows > 0) {

				$registro = mysqli_fetch_array($result);
				$response["erro"] = false;
				$response["codAcesso"] = $registro['codAcesso'];
				$response["codForn"] = $registro['codForn'];
				$response["direcAcesso"] = $registro['direcAcesso'];
				$response["codUsuario"] = $registro['codUsuario'];
				$response["nomeUsuario"] = $registro['nomeConsult'];
				$response["cpfUsuario"] = $registro['cpfConsult'];
				$response["razaoForn"] = $registro['nomeForn'];
				$response["cnpjForn"] = $registro['cnpjForn'];
				$response["valorPedido"] = number_format($registro['valorPedido'], 2, ',', '.');
			} else {
				$response["mensagem"] = "Usuário não existe!";
			}
		} else {




			$sql = "SET sql_mode = ''; select acesso.codAcesso, acesso.direcAcesso, associado.razaoAssociado AS nomeForn, associado.cnpjAssociado AS cnpjForn, acesso.codUsuario, associado.codAssociado AS codForn, consultor.nomeConsult, consultor.cpfConsult			
			FROM acesso
			join consultor on acesso.codUsuario = consultor.codConsult
			join relaciona on relaciona.codAssocRelaciona = consultor.codConsult
			join associado on associado.codAssociado = relaciona.codConsultRelaciona
			WHERE acesso.codAcesso = $codAcessoa limit 1";

			$result = $conn->query($sql);


			if ($result->num_rows > 0) {

				$registro = mysqli_fetch_array($result);
				$response["erro"] = false;
				$response["codAcesso"] = $registro['codAcesso'];
				$response["codForn"] = $registro['codForn'];
				$response["direcAcesso"] = $registro['direcAcesso'];
				$response["codUsuario"] = $registro['codUsuario'];
				$response["nomeUsuario"] = $registro['nomeConsult'];
				$response["cpfUsuario"] = $registro['cpfConsult'];
				$response["razaoForn"] = $registro['nomeForn'];
				$response["cnpjForn"] = $registro['cnpjForn'];
				$response["valorPedido"] = number_format(0, 2, ',', '.');;
			} else {
				$response["mensagem"] = "Usuário não existe!";
			}
		}

		/*ULTIMO ELSE PARA VERIFICAR SE E COLABORADOR DA EMPRESA DO EVENTO*/
	} else if ($resultadoDirec['direcAcesso'] == 3) {



		$sqlTeste = "SET sql_mode = ''; select codMercPedido
		from pedido join organizador on pedido.codOrganizador = organizador.codOrg
		join consultor on consultor.codFornConsult = organizador.codOrg
		join acesso on acesso.codUsuario = consultor.codConsult
		where acesso.codAcesso = $codAcessoa
		limit 1";

		$resultadoAssoc = $conn->query($sqlTeste);
		$resultAs = mysqli_fetch_array($resultadoAssoc);

		if ($resultadoAssoc->num_rows > 0) {


			$sql = "SET sql_mode = '';
			select acesso.codAcesso, 
			acesso.direcAcesso, 
			organizador.nomeOrg AS nomeForn,
			organizador.cnpjOrg AS cnpjForn, 
			acesso.codUsuario, 
			organizador.codOrg AS codForn, 
			consultor.nomeConsult, 
			consultor.cpfConsult,
			sum(mercadoria.precoMercadoria*pedido.quantMercPedido) as 'valorPedido'
			FROM acesso
			join consultor on acesso.codUsuario = consultor.codConsult
			join organizador on organizador.codOrg = consultor.codFornConsult
			join pedido on pedido.codOrganizador = organizador.codOrg
			join mercadoria on mercadoria.codMercadoria = pedido.codMercPedido
			where codOrganizador = 158
			and acesso.codAcesso =   $codAcessoa";

			$result = $conn->query($sql);


			if ($result->num_rows > 0) {

				$registro = mysqli_fetch_array($result);
				$response["erro"] = false;
				$response["codAcesso"] = $registro['codAcesso'];
				$response["codForn"] = $registro['codForn'];
				$response["direcAcesso"] = $registro['direcAcesso'];
				$response["codUsuario"] = $registro['codUsuario'];
				$response["nomeUsuario"] = $registro['nomeConsult'];
				$response["cpfUsuario"] = $registro['cpfConsult'];
				$response["razaoForn"] = $registro['nomeForn'];
				$response["cnpjForn"] = $registro['cnpjForn'];
				$response["valorPedido"] = number_format($registro['valorPedido'], 2, ',', '.');
			} else {
				$response["mensagem"] = "Usuário não existe!";
			}
		} else {




			$sql = "SET sql_mode = ''; select acesso.codAcesso, 
			acesso.direcAcesso, 
			organizador.nomeOrg AS nomeForn, 
			organizador.cnpjOrg AS cnpjForn, 
			acesso.codUsuario, 
			organizador.codOrg AS codForn, 
			consultor.nomeConsult, 
			consultor.cpfConsult		
			FROM acesso
			join consultor on acesso.codUsuario = consultor.codConsult
			join organizador on organizador.codOrg = consultor.codFornConsult
			WHERE acesso.codAcesso = $codAcessoa limit 1";

			$result = $conn->query($sql);


			if ($result->num_rows > 0) {

				$registro = mysqli_fetch_array($result);
				$response["erro"] = false;
				$response["codAcesso"] = $registro['codAcesso'];
				$response["codForn"] = $registro['codForn'];
				$response["direcAcesso"] = $registro['direcAcesso'];
				$response["codUsuario"] = $registro['codUsuario'];
				$response["nomeUsuario"] = $registro['nomeConsult'];
				$response["cpfUsuario"] = $registro['cpfConsult'];
				$response["razaoForn"] = $registro['nomeForn'];
				$response["cnpjForn"] = $registro['cnpjForn'];
				$response["valorPedido"] = number_format(0, 2, ',', '.');
			} else {
				$response["mensagem"] = "Usuário não existe!";
			}
		}
	}




	$conn->close();
}
echo json_encode($response);
